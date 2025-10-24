"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjectStore } from "@/stores/project.store";
import { useAuthStore } from "@/stores/auth.store";
import { useTaskStore } from "@/stores/task.store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  CheckSquare, 
  Plus, 
  Search,
  Calendar,
  User,
  Flag,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle
} from "lucide-react";

export default function ManagerTasks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [taskAssignees, setTaskAssignees] = useState<Record<string, { firstName: string; lastName: string } | null>>({});

  const { getTasksByProject, getTasks, tasks, getUserByTask } = useTaskStore();
  const { getProjectsByManager, projects } = useProjectStore();
  const { user } = useAuthStore();

  useEffect(() => {
    // Fetch projects for the manager
    const fetchProjects = async () => {
      if(user?._id){
         await getProjectsByManager(user._id);
      }
    }
    fetchProjects();
  }, [user?._id, getProjectsByManager]);

  // Fetch tasks when project selection changes
  useEffect(() => {
    const fetchTasks = async () => {
      if (selectedProject === "all") {
        await getTasks();
      } else if (selectedProject && selectedProject !== "all") {
        await getTasksByProject(selectedProject);
      }
    };
    fetchTasks();
  }, [selectedProject, getTasksByProject, getTasks]);

  // Fetch assignee information for each task
  useEffect(() => {
    const fetchAssignees = async () => {
      if (tasks.length > 0) {
        const assigneeData: Record<string, { firstName: string; lastName: string } | null> = {};

        
        for (const task of tasks) {
          if (task.assignedTo) {
            try {
              const userData = await getUserByTask(String(task.assignedTo));
              if (userData) {
                assigneeData[String(task.assignedTo)] = {
                  firstName: userData.firstName,
                  lastName: userData.lastName
                };
              }
            } catch (error) {
              console.error('Failed to fetch assignee for task:', task.assignedTo, error);
              assigneeData[String(task.assignedTo)] = null;
            }
          }
        }
        
        setTaskAssignees(assigneeData);
      }
    };
    
    fetchAssignees();
  }, [tasks, getUserByTask]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "in-progress":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "todo":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-orange-500";
      case "low":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "in-progress":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "todo":
        return <Circle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Circle className="w-5 h-5" />;
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = selectedTab === "all" || task.status === selectedTab;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    // Note: assignedTo is an ObjectId, will need to be populated from backend
    const matchesAssignee = assigneeFilter === "all";
    return matchesSearch && matchesTab && matchesPriority && matchesAssignee;
  });

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === "todo").length,
    inProgress: tasks.filter(t => t.status === "in-progress").length,
    done: tasks.filter(t => t.status === "done").length
  };

  // Note: assignedTo is ObjectId, will need backend to populate user data
  const assignees: string[] = [];

  return (
    <div className=" space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Task Management</h1>
          <p className="text-muted-foreground mt-1">
            Create, assign, and monitor tasks across all projects
          </p>
        </div>
        <div className="flex flex-row gap-2">
                  <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Task
        </Button>
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="">
            <SelectValue placeholder="Filter by Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {Array.isArray(projects) && projects.length > 0 ? (
              projects.map((project) => (
                <SelectItem key={String(project._id)} value={String(project._id)}>
                  {project.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="none" disabled>No projects available</SelectItem>
            )}
          </SelectContent>
        </Select>
        </div>

      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              To Do
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.todo}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Done
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.done}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Members</SelectItem>
            {assignees.map((assignee) => (
              <SelectItem key={assignee} value={assignee}>
                {assignee}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tasks */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="todo">To Do</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="done">Done</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6 space-y-4">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="pt-1">{getStatusIcon(task.status)}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{task.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {task.description}
                        </CardDescription>
                      </div>
                      <Flag className={`w-5 h-5 ${getPriorityColor(task.priority)}`} />
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="outline" className={getStatusColor(task.status)}>
                        {task.status.replace("-", " ")}
                      </Badge>
                      <Badge variant="outline">{task.priority} priority</Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-4 h-4" />
                        <span>Project ID: {String(task.projectId)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-4 h-4" />
                        <span>Project Name: {String(task.title)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Assigned To: 
                          {taskAssignees[String(task.assignedTo)] 
                            ? ` ${taskAssignees[String(task.assignedTo)]?.firstName} ${taskAssignees[String(task.assignedTo)]?.lastName}`
                            : task.assignedTo 
                              ? String(task.assignedTo)
                              : 'Unassigned'
                          }
                        </span>
                      </div>
                      {task.dueDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Due: {new Date(task.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Reassign</Button>
                      <Button size="sm">View Details</Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}

          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
              <p className="text-muted-foreground">
                {selectedProject !== "all" 
                  ? "No tasks for this project. Create a new task or select a different project." 
                  : "Try adjusting your filters or create a new task."}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
