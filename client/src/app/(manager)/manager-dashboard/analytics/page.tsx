"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp,
  TrendingDown,
  Users,
  FolderKanban,
  CheckCircle2,
  Clock,
  Target
} from "lucide-react";

// Mock data - replace with actual API calls
const stats = {
  totalProjects: 12,
  activeProjects: 8,
  completedTasks: 234,
  pendingTasks: 67,
  teamMembers: 15,
  completionRate: 78,
  onTimeDelivery: 85,
  avgTaskTime: "3.2 days"
};

const projectPerformance = [
  { name: "E-Commerce Platform", progress: 65, status: "on-track", tasksCompleted: 23, totalTasks: 35 },
  { name: "Mobile App Redesign", progress: 40, status: "at-risk", tasksCompleted: 12, totalTasks: 30 },
  { name: "API Integration", progress: 100, status: "completed", tasksCompleted: 18, totalTasks: 18 },
  { name: "Dashboard Analytics", progress: 10, status: "on-track", tasksCompleted: 2, totalTasks: 25 }
];

const teamPerformance = [
  { name: "Emily Rodriguez", tasksCompleted: 45, tasksInProgress: 6, efficiency: 88 },
  { name: "Tom Anderson", tasksCompleted: 78, tasksInProgress: 5, efficiency: 92 },
  { name: "Jessica Martinez", tasksCompleted: 23, tasksInProgress: 7, efficiency: 76 },
  { name: "Alex Thompson", tasksCompleted: 56, tasksInProgress: 4, efficiency: 85 }
];

const recentActivities = [
  { type: "task-completed", user: "Emily Rodriguez", action: "completed task", target: "Implement user authentication", time: "2 minutes ago" },
  { type: "project-update", user: "Tom Anderson", action: "updated project", target: "E-Commerce Platform", time: "15 minutes ago" },
  { type: "task-created", user: "You", action: "created task", target: "Design product listing page", time: "1 hour ago" },
  { type: "milestone", user: "System", action: "milestone reached", target: "API Integration - 100% complete", time: "2 hours ago" }
];

export default function ManagerAnalytics() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "on-track":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "at-risk":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "completed":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Track team performance and project metrics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FolderKanban className="w-4 h-4" />
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">
              of {stats.totalProjects} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.completionRate}%</div>
            <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+5% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.pendingTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completedTasks} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamMembers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active contributors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold">{stats.onTimeDelivery}%</div>
              <Progress value={stats.onTimeDelivery} />
              <p className="text-xs text-muted-foreground">
                Projects delivered on schedule
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Avg. Task Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold">{stats.avgTaskTime}</div>
              <div className="flex items-center gap-1 text-xs text-green-500">
                <TrendingDown className="w-3 h-3" />
                <span>0.5 days faster than last month</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Team Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold">86%</div>
              <Progress value={86} />
              <p className="text-xs text-muted-foreground">
                Overall team productivity score
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">Project Performance</TabsTrigger>
          <TabsTrigger value="team">Team Performance</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        {/* Project Performance */}
        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Performance Overview</CardTitle>
              <CardDescription>Track progress and status of all projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projectPerformance.map((project, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{project.name}</span>
                          <Badge variant="outline" className={getStatusColor(project.status)}>
                            {project.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {project.tasksCompleted} of {project.totalTasks} tasks completed
                        </p>
                      </div>
                      <span className="font-bold">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Performance */}
        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Member Performance</CardTitle>
              <CardDescription>Individual productivity and efficiency metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {teamPerformance.map((member, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{member.name}</span>
                      <Badge variant="outline">
                        {member.efficiency}% efficiency
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Completed</div>
                        <div className="text-2xl font-bold text-green-500">
                          {member.tasksCompleted}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">In Progress</div>
                        <div className="text-2xl font-bold text-blue-500">
                          {member.tasksInProgress}
                        </div>
                      </div>
                    </div>
                    <Progress value={member.efficiency} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Activity */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates and changes across all projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {activity.type === "task-completed" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                      {activity.type === "project-update" && <FolderKanban className="w-4 h-4 text-blue-500" />}
                      {activity.type === "task-created" && <Target className="w-4 h-4 text-yellow-500" />}
                      {activity.type === "milestone" && <Target className="w-4 h-4 text-purple-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>
                        {" "}{activity.action}{" "}
                        <span className="font-medium">{activity.target}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
