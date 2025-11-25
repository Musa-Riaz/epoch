"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingDown,
  Users,
  FolderKanban,
  CheckCircle2,
  Clock,
  Target
} from "lucide-react";

import { useProjectStore } from "@/stores/project.store";
import { useAuthStore } from "@/stores/auth.store";
import { useEffect, useState } from "react";
import { ProjectAnalyticsResponse } from "@/interfaces/api";

// Mock data - replace with actual API calls
const stats = {
  onTimeDelivery: 85,
  avgTaskTime: "3.2 days"
};

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

  // hooks
  const { user, getManagerAnalytics } = useAuthStore();
  const { getProjectsByManager, projects, getProjectAnalytics } = useProjectStore();

  // states

  interface ManagerAnalytics {
    totalProjects: number;
    totalMembers: number;
  }

  const [analytics, setAnalytics] = useState<ManagerAnalytics | null>(null);
  const [projectAnalytics, setProjectAnalytics] = useState<Record<string, ProjectAnalyticsResponse | null>>({});

  // Calculate aggregate stats from project analytics
  const aggregateStats = {
    totalTasks: Object.values(projectAnalytics).reduce((sum, analytics) => sum + (analytics?.totalTasks || 0), 0),
    completedTasks: Object.values(projectAnalytics).reduce((sum, analytics) => sum + (analytics?.completedTasks || 0), 0),
    pendingTasks: Object.values(projectAnalytics).reduce((sum, analytics) => sum + (analytics?.pendingTasks || 0), 0),
    inProgressTasks: Object.values(projectAnalytics).reduce((sum, analytics) => sum + (analytics?.inProgressTasks || 0), 0),
  };

  const completionRate = aggregateStats.totalTasks > 0 
    ? Math.round((aggregateStats.completedTasks / aggregateStats.totalTasks) * 100) 
    : 0;


  // Fetch the projects as soon as the page loads
  useEffect(() => {
    const fetchProjects = async () => {
      if (user?.role === "manager" && user?._id) {
        await getProjectsByManager(user._id);
        // After getting projects, fetch analytics
        setAnalytics(await getManagerAnalytics(user._id));
      }
    }
    
    fetchProjects();
  }, [user, getProjectsByManager, getManagerAnalytics]);

    // use effect to fetch project analytics - runs when projects are loaded
    useEffect(() => {
      const fetchProjectAnalytics = async () => {
        if (user?.role === 'manager' && user?._id && projects.length > 0) {
          // fetch analytics for each project
          for (const project of projects) {
            try {
              const res = await getProjectAnalytics(String(project._id));
              setProjectAnalytics((prev) => ({
                ...prev,
                [String(project._id)]: res || null
              }));
            } catch (error) {
              console.error('Failed to fetch analytics for project:', project._id, error);
            }
          }
        }
      }
      fetchProjectAnalytics();
    }, [projects, user, getProjectAnalytics]);


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
            <div className="text-2xl font-bold">{projects?.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              of {projects?.length} total
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
            <div className="text-2xl font-bold text-green-500">{completionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {aggregateStats.completedTasks} of {aggregateStats.totalTasks} tasks
            </p>
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
            <div className="text-2xl font-bold text-yellow-500">{aggregateStats.pendingTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {aggregateStats.inProgressTasks} in progress
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
            <div className="text-2xl font-bold">{analytics?.totalMembers}</div>
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
              {projects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderKanban className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No projects available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((project) => {
                    // extracting anayltics by using the project Id as key
                    const analytics = projectAnalytics[String(project._id)];
                    const progress = analytics?.progress || project.progress || 0;
                    const completedTasks = analytics?.completedTasks || 0;
                    const totalTasks = analytics?.totalTasks || 0;
                    
                    return (
                      <div key={String(project._id)} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{project.name}</span>
                              <Badge variant="outline" className={getStatusColor(project.status)}>
                                {project.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {completedTasks} of {totalTasks} tasks completed
                            </p>
                          </div>
                          <span className="font-bold">{progress}%</span>
                        </div>
                        <Progress value={progress} />
                      </div>
                    );
                  })}
                </div>
              )}
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
