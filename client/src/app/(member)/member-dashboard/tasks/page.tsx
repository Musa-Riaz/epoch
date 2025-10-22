"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Clock,
  Flag,
  AlertCircle,
  CheckCircle2,
  Circle
} from "lucide-react";

// Mock data - replace with actual API calls
const mockTasks = [
  {
    id: 1,
    title: "Implement user authentication",
    description: "Add JWT-based authentication with refresh tokens",
    status: "in-progress",
    priority: "high",
    dueDate: "2025-10-25",
    project: "E-Commerce Platform",
    assignedBy: "Sarah Johnson",
    tags: ["backend", "security"]
  },
  {
    id: 2,
    title: "Design product listing page",
    description: "Create responsive product grid with filters",
    status: "todo",
    priority: "high",
    dueDate: "2025-10-28",
    project: "E-Commerce Platform",
    assignedBy: "Sarah Johnson",
    tags: ["frontend", "ui/ux"]
  },
  {
    id: 3,
    title: "Setup database schema",
    description: "Design and implement MongoDB collections",
    status: "completed",
    priority: "high",
    dueDate: "2025-10-20",
    project: "E-Commerce Platform",
    assignedBy: "Sarah Johnson",
    tags: ["database", "backend"]
  },
  {
    id: 4,
    title: "Create mobile mockups",
    description: "Design high-fidelity mockups for mobile app",
    status: "in-progress",
    priority: "medium",
    dueDate: "2025-11-05",
    project: "Mobile App Redesign",
    assignedBy: "Mike Chen",
    tags: ["design", "mobile"]
  },
  {
    id: 5,
    title: "Write API documentation",
    description: "Document all REST API endpoints",
    status: "todo",
    priority: "low",
    dueDate: "2025-11-15",
    project: "API Integration",
    assignedBy: "David Kim",
    tags: ["documentation"]
  },
  {
    id: 6,
    title: "Implement payment gateway",
    description: "Integrate Stripe payment processing",
    status: "completed",
    priority: "high",
    dueDate: "2025-10-18",
    project: "API Integration",
    assignedBy: "Sarah Johnson",
    tags: ["backend", "payment"]
  },
  {
    id: 7,
    title: "Setup CI/CD pipeline",
    description: "Configure automated testing and deployment",
    status: "todo",
    priority: "medium",
    dueDate: "2025-11-01",
    project: "Dashboard Analytics",
    assignedBy: "David Kim",
    tags: ["devops", "automation"]
  },
  {
    id: 8,
    title: "Performance optimization",
    description: "Optimize database queries and API response times",
    status: "in-progress",
    priority: "medium",
    dueDate: "2025-10-30",
    project: "E-Commerce Platform",
    assignedBy: "Sarah Johnson",
    tags: ["backend", "performance"]
  }
];

export default function MyTasks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");

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

  const filteredTasks = mockTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = selectedTab === "all" || task.status === selectedTab;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    const matchesProject = projectFilter === "all" || task.project === projectFilter;
    return matchesSearch && matchesTab && matchesPriority && matchesProject;
  });

  const stats = {
    total: mockTasks.length,
    todo: mockTasks.filter(t => t.status === "todo").length,
    inProgress: mockTasks.filter(t => t.status === "in-progress").length,
    completed: mockTasks.filter(t => t.status === "completed").length
  };

  const projects = Array.from(new Set(mockTasks.map(t => t.project)));

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
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Task
        </Button>
      </div>

      {/* Stats Cards */}
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
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
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
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project} value={project}>
                {project}
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
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="hover:shadow-lg transition-shadow">
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
                        {task.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CheckSquare className="w-4 h-4" />
                          <span>{task.project}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>Assigned by: {task.assignedBy}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm">View Details</Button>
                        {task.status !== "completed" && (
                          <Button size="sm">
                            {task.status === "todo" ? "Start Task" : "Mark Complete"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try adjusting your filters" : "You don't have any tasks yet"}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
