"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCardSkeleton, TaskDetailSkeleton } from "@/components/ui/skeleton-loaders";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  CheckSquare, 
  Search, 
  Calendar,
  Clock,
  Flag,
  CheckCircle2,
  Circle
} from "lucide-react";
import { useTaskStore } from "@/stores/task.store";
import { useProjectStore } from "@/stores/project.store";
import { useAuthStore } from "@/stores/auth.store";

export default function MyTasks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const {user} = useAuthStore();
  const {getTasksByAssignedUser, tasks} = useTaskStore();
  const { projects, getProjects }= useProjectStore();

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
      case "done":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "in-progress":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "todo":
        return <Circle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Circle className="w-5 h-5" />;
    }
  };


  // fetch tasks on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoadingTasks(true);
      try {
        await getTasksByAssignedUser(String(user?._id));
      } finally {
        setIsLoadingTasks(false);
      }
    };
    fetchTasks();
  }, [user, getTasksByAssignedUser]);

  // fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoadingProjects(true);
      try {
        await getProjects();
      } finally {
        setIsLoadingProjects(false);
      }
    }
    fetchProjects()
  }, [getProjects])


  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task?.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = selectedTab === "all" || task.status === selectedTab;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    const matchesProject = projectFilter === "all" || String(task?.projectId) === projectFilter;
    return matchesSearch && matchesTab && matchesPriority && matchesProject;
  });

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === "todo").length,
    inProgress: tasks.filter(t => t.status === "in-progress").length,
    done: tasks.filter(t => t.status === "done").length
  };

// filter the projects on which the user is a part of the team
const userProjects = projects.filter((project) => 
  project.team.some((teamMember) => String(teamMember) === String(user?._id))
);

const handleGetProjectName = (projectId: string) => {
  const project = projects.find((proj) => proj._id === projectId);
  return project ? project.name : "Unknown Project";
}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage all your assigned tasks
          </p>
        </div>
        {/* <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Task
        </Button> */}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {isLoadingTasks ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </>
        ) : (
          <>
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
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{stats?.done}</div>
              </CardContent>
            </Card>
          </>
        )}
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
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {userProjects.map((project) => (
              <SelectItem key={String(project?._id)} value={String(project?._id)}>
                {project?.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tasks Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="todo">To Do</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="done">Done</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          <div className="space-y-4">
            {isLoadingTasks ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <TaskDetailSkeleton key={i} />
                ))}
              </>
            ) : filteredTasks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No tasks found</p>
                </CardContent>
              </Card>
            ) : (
              filteredTasks.map((task) => (
              <Card key={String(task._id)} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="pt-1">
                      {getStatusIcon(task.status)}
                    </div>
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
                        {/* {task?.tags?.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))} */}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CheckSquare className="w-4 h-4" />
                          <span>{task.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Due: { task.dueDate ? (
                            new Date(task?.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
                          ) : ("N/A") }</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>Project: {handleGetProjectName(String(task?.projectId))}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm">View Details</Button>
                        {task.status !== "done" && (
                          <Button size="sm">
                            {task.status === "todo" ? "Start Task" : "Mark Complete"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
