"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  StatsCardSkeleton, 
  ProjectCardSkeleton 
} from "@/components/ui/skeleton-loaders";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/stores/auth.store";
import { useProjectStore } from "@/stores/project.store";
import { useActivityStore } from "@/stores/activity.store";
import { getSocket } from "@/lib/socket";
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  FolderKanban,
  Plus,
  TrendingUp,
  Users,
  AlertCircle,
  FileText,
  Activity,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { IActivity, ProjectAnalyticsResponse } from "@/interfaces/api";

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  
  // Form state
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectDeadline, setProjectDeadline] = useState("");
  const [memberEmails, setMemberEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [projectStatus, setProjectStatus] = useState<'active' | 'completed' | 'archived'>('active');
  const [isCreating, setIsCreating] = useState(false);
  const [projectAnalytics, setProjectAnalytics] = useState<Record<string, ProjectAnalyticsResponse | null>>({});
  

  const { getManagerAnalytics, user } = useAuthStore();
  const token = useAuthStore((state) => state.token);
  const { createProject, getProjectsByManager, getProjectAnalytics, projects } = useProjectStore();
  const { activities, getActivities, isLoading: isLoadingActivities, pushActivity } = useActivityStore();


  interface ManagerAnalytics {
    totalProjects: number;
    totalMembers: number;
  }

  const [stats, setStats] = React.useState<ManagerAnalytics | null>(null);

  const derivedStats = useMemo(() => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter((project) => project.status === "active").length;
    const completedProjects = projects.filter((project) => project.status === "completed").length;

    const totals = projects.reduce(
      (acc, project) => {
        const analytics = projectAnalytics[String(project._id)];
        acc.totalTasks += analytics?.totalTasks ?? 0;
        acc.pendingTasks += analytics?.pendingTasks ?? 0;
        acc.upcomingDeadlines += project.deadline
          ? new Date(project.deadline).getTime() <= Date.now() + 7 * 24 * 60 * 60 * 1000
            ? 1
            : 0
          : 0;
        return acc;
      },
      { totalTasks: 0, pendingTasks: 0, upcomingDeadlines: 0 }
    );

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks: totals.totalTasks,
      pendingTasks: totals.pendingTasks,
      upcomingDeadlines: totals.upcomingDeadlines,
    };
  }, [projects, projectAnalytics]);

// use effect to fetch manager analytics
  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoadingStats(true);
      try {
        if(user?.role === 'manager' && user?._id) {
          const analytics = await getManagerAnalytics(user._id);
          // Update state or perform actions with the analytics data
          setStats(analytics);
        }
      } finally {
        setIsLoadingStats(false);
      }
    }
    fetchAnalytics();
  }, [user, getManagerAnalytics]);

    // use effect to fetch projects
    useEffect(() => {
      const fetchProjects = async () => {
        setIsLoadingProjects(true);
        try {
          if(user?.role === 'manager' && user?._id) {
            await getProjectsByManager(user._id);
          }
        } finally {
          setIsLoadingProjects(false);
        }
      }
      fetchProjects();
    }, [user, getProjectsByManager]);

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

    useEffect(() => {
      const fetchActivities = async () => {
        if (user?.role === 'manager' && user?._id) {
          await getActivities({ page: 1, limit: 20 });
        }
      };

      fetchActivities();
    }, [user, getActivities]);

    useEffect(() => {
      if (!user?._id) return;

      const socket = getSocket();
      socket.emit('subscribe:user', user._id);

      const onActivity = (payload: IActivity) => {
        pushActivity(payload);
      };

      socket.on('activity:new', onActivity);
      return () => {
        socket.off('activity:new', onActivity);
      };
    }, [user?._id, pushActivity]);

  const formatActivityTime = (dateValue: string) => {
    const activityDate = new Date(dateValue);
    if (Number.isNaN(activityDate.getTime())) return 'Unknown time';

    const diffMs = Date.now() - activityDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return activityDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getActivityIcon = (actionType: string) => {
    if (actionType.includes('comment')) {
      return <FileText className="h-4 w-4 text-blue-500" />;
    }

    if (actionType.includes('created') || actionType.includes('assigned')) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }

    return <AlertCircle className="h-4 w-4 text-orange-500" />;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddEmail = () => {
    const email = currentEmail.trim();
    
    if (!email) {
      setEmailError("Please enter an email address");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (memberEmails.includes(email)) {
      setEmailError("This email has already been added");
      return;
    }

    setMemberEmails((prev) => [...prev, email]);
    setCurrentEmail("");
    setEmailError("");
    
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setMemberEmails((prev) => prev.filter((email) => email !== emailToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const handleCreateProject = async () => {
    if (!projectName.trim() || !user?._id) return;

    setIsCreating(true);
    try {
      const projectData = {
        name: projectName,
        description: projectDescription,
        owner: user._id,
        teamEmails: memberEmails, // Send emails instead of user IDs
        status: projectStatus,
        deadline: projectDeadline || undefined,
      };

      const newProject = await createProject(projectData);
      
      if (newProject) {
        toast.success('Project created successfully!');
        
        // Send invitation emails if any were provided
        if (memberEmails.length > 0) {
          try {
                                      // TODO:: Change it to .env variable when working with development
            const response = await fetch(`http://localhost:8500/api/invitations/send`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                projectId: newProject._id,
                emails: memberEmails,
              }),
            });

            const result = await response.json();
            
            if (result.success) {
              const successCount = result.data.results.filter((r: { success: boolean }) => r.success).length;
              toast.success(`Sent ${successCount} invitation(s)!`);
            } else {
              toast.error('Failed to send some invitations');
            }
          } catch (error) {
            console.error('Failed to send invitations:', error);
            toast.error('Failed to send invitation emails');
          }
        }
        
        // Reset form
        setProjectName("");
        setProjectDescription("");
        setProjectDeadline("");
        setMemberEmails([]);
        setCurrentEmail("");
        setEmailError("");
        setProjectStatus('active');
        setIsCreateProjectOpen(false);
        
        // Refresh projects list
        await getProjectsByManager(user._id);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsCreating(false);
    }
  };

  //TODO: currently, for stats I am only getting the total number of projects. Need to expand this to get other stats as well.

  // Mock data - replace with actual API calls

  

  const members = [
    {
      id: 1,
      name: "Noah Alvarez",
      email: "noah.alvarez@example.com",
      activeTasks: 8,
      completedTasks: 24,
      projects: 3,
    },
    {
      id: 2,
      name: "Priya Raman",
      email: "priya.raman@example.com",
      activeTasks: 5,
      completedTasks: 18,
      projects: 2,
    },
    {
      id: 3,
      name: "Liam Okafor",
      email: "liam.okafor@example.com",
      activeTasks: 6,
      completedTasks: 15,
      projects: 2,
    },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manager Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage your projects, tasks, and team members
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="outline">{derivedStats.totalProjects} projects</Badge>
              <Badge variant="outline">{stats?.totalMembers ?? 0} members</Badge>
              <Badge variant="outline">{derivedStats.pendingTasks} pending tasks</Badge>
            </div>
          </div>
          
          {/* Create Project Dialog */}
          <Dialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Add a new project and assign team members to it.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Project Name */}
                <div className="space-y-2">
                  <Label htmlFor="project-name">
                    Project Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="project-name"
                    placeholder="Enter project name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>

                {/* Project Description */}
                <div className="space-y-2">
                  <Label htmlFor="project-description">Description</Label>
                  <Textarea
                    id="project-description"
                    placeholder="Enter project description"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Deadline and Status Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Deadline */}
                  <div className="space-y-2">
                    <Label htmlFor="project-deadline">Deadline</Label>
                    <Input
                      id="project-deadline"
                      type="date"
                      value={projectDeadline}
                      onChange={(e) => setProjectDeadline(e.target.value)}
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="project-status">Status</Label>
                    <Select value={projectStatus} onValueChange={(value: 'active' | 'completed' | 'archived') => setProjectStatus(value)}>
                      <SelectTrigger id="project-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Team Members */}
                <div className="space-y-2">
                  <Label>Invite Team Members via Email</Label>
                  <div className="space-y-3">
                    {/* Email Input */}
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          id="member-email"
                          type="email"
                          placeholder="Enter team member email"
                          value={currentEmail}
                          onChange={(e) => {
                            setCurrentEmail(e.target.value);
                            setEmailError("");
                          }}
                          onKeyPress={handleKeyPress}
                          className={emailError ? "border-red-500" : ""}
                        />
                        {emailError && (
                          <p className="text-xs text-red-500 mt-1">{emailError}</p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddEmail}
                        disabled={!currentEmail.trim()}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>

                    {/* Added Emails List */}
                    {memberEmails.length > 0 && (
                      <div className="border rounded-lg p-3 space-y-2 max-h-[200px] overflow-y-auto">
                        {memberEmails.map((email, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-secondary/50 rounded-md"
                          >
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Users className="h-4 w-4 text-primary" />
                              </div>
                              <span className="text-sm font-medium">{email}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveEmail(email)}
                              className="h-8 w-8 p-0"
                            >
                              <span className="sr-only">Remove</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      {memberEmails.length === 0 
                        ? "Add email addresses of team members you want to invite to this project"
                        : `${memberEmails.length} member${memberEmails.length !== 1 ? 's' : ''} will receive an invitation email`
                      }
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateProjectOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateProject}
                  disabled={!projectName.trim() || isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Project
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {isLoadingStats ? (
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <StatsCardSkeleton key={i} />
              ))}
            </>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                  <FolderKanban className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{derivedStats.totalProjects}</div>
                  <p className="text-xs text-muted-foreground">
                    active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{derivedStats.activeProjects}</div>
                  <p className="text-xs text-muted-foreground">
                    {derivedStats.completedProjects} completed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{derivedStats.pendingTasks}</div>
                  <p className="text-xs text-muted-foreground">Across all projects</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{derivedStats.upcomingDeadlines}</div>
                  <p className="text-xs text-muted-foreground">Next 7 days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalMembers}</div>
                  <p className="text-xs text-muted-foreground">Active members</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Projects Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Projects</CardTitle>
                  <CardDescription>Your most recent active projects</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {projects.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
                      No projects available yet. Create your first project to start tracking team progress.
                    </div>
                  ) : projects.slice(0, 3).map((project) => {
                    const analytics = projectAnalytics[String(project._id)];
                    const completedTasks = analytics?.completedTasks || 0;
                    const totalTasks = analytics?.totalTasks || 0;
                    return (
                    <div key={project._id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {completedTasks}/{totalTasks} tasks completed
                          </p>
                        </div>
                        <Badge
                          variant={
                            project.status === "completed"
                              ? "default"
                              : project.status === "active"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {project.status}
                        </Badge>
                      </div>
                      <Progress value={project.progress} />
                    </div>
                    )
})}
                </CardContent>
              </Card>

              {/* Activity Feed */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates from your team</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoadingActivities ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading activity...
                      </div>
                    ) : activities.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No recent activity yet.</p>
                    ) : (
                      activities.slice(0, 6).map((activity) => (
                        <div key={activity._id} className="flex gap-3">
                          <Activity className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div className="flex-1 space-y-1">
                            <p className="text-sm">
                              <span className="font-medium">{activity.actorName || activity.actorEmail || 'Team member'}</span>{' '}
                              {activity.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(activity.projectName || activity.targetName || 'Workspace')} • {formatActivityTime(activity.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Task Distribution</CardTitle>
                  <CardDescription>Tasks by status across all projects</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="h-16 w-16 mx-auto mb-2 opacity-50" />
                    <p>Chart visualization will be added here</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Member Workload</CardTitle>
                  <CardDescription>Task distribution among team members</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="h-16 w-16 mx-auto mb-2 opacity-50" />
                    <p>Chart visualization will be added here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Projects</CardTitle>
                    <CardDescription>Manage your projects and track progress</CardDescription>
                  </div>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Project
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoadingProjects ? (
                    <>
                      {[1, 2, 3].map((i) => (
                        <ProjectCardSkeleton key={i} />
                      ))}
                    </>
                  ) : projects.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No projects found. Create your first project!</p>
                    </div>
                  ) : (
                    projects.map((project) => (
                    <Card key={project._id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-xl">{project.name}</CardTitle>
                            <CardDescription className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {project.team?.length || 0} members
                              </span>
                              {project.deadline && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Due: {new Date(project.deadline).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                                </span>
                              )}
                            </CardDescription>
                          </div>
                          <Badge
                            variant={
                              project.status === "completed"
                                ? "default"
                                : project.status === "active"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {project.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} />
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            {String(projectAnalytics[String(project._id)]?.completedTasks || 0)} of {String(projectAnalytics[String(project._id)]?.totalTasks || 0)} tasks completed
                          </p>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>
                      View and manage team member workloads
                    </CardDescription>
                  </div>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.map((member) => (
                    <Card key={member.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-3">
                            <div>
                              <h3 className="font-semibold">{member.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {member.email}
                              </p>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Active Tasks</p>
                                <p className="font-semibold text-lg">
                                  {member.activeTasks}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Completed</p>
                                <p className="font-semibold text-lg">
                                  {member.completedTasks}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Projects</p>
                                <p className="font-semibold text-lg">{member.projects}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                View Profile
                              </Button>
                              <Button variant="outline" size="sm">
                                Assign Tasks
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>
                  Track all changes and updates across your projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {isLoadingActivities ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading activity log...
                    </div>
                  ) : activities.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No activity available yet.</p>
                  ) : (
                    activities.map((activity, idx) => (
                    <div key={activity._id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background">
                          {getActivityIcon(activity.actionType)}
                        </div>
                        {idx < activities.length - 1 && (
                          <div className="w-px h-12 bg-border" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1 pb-8">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{activity.actorName || activity.actorEmail || 'Team member'}</p>
                          <p className="text-xs text-muted-foreground">{formatActivityTime(activity.createdAt)}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {activity.message}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {activity.projectName || activity.actionType}
                        </Badge>
                      </div>
                    </div>
                  ))) }
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default ManagerDashboard;
