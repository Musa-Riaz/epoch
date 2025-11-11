"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/stores/auth.store";
import { useProjectStore } from "@/stores/project.store";
import { ProjectAnalyticsResponse } from "@/interfaces/api";
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function MyProjects() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [analytics, setAnalytics] = useState<Record<string, ProjectAnalyticsResponse>>({});
  const [managerNames, setManagerNames] = useState<Record<string, string>>({});
  const { user } = useAuthStore();
  const { projects, getProjects, getProjectAnalytics, getManagerByProject } = useProjectStore();

  // fetch projects on component mount 
  useEffect(() => {
    const fetchProjects = async () => {
      await getProjects();
    }
    fetchProjects();
  }, [getProjects]);

  // fetch project analytics and manager names when projects change
  useEffect(() => {
    const fetchProjectData = async () => {
      if (projects.length === 0) return;
      
      const analyticsData: Record<string, ProjectAnalyticsResponse> = {};
      const managersData: Record<string, string> = {};
      
      for (const project of projects) {
        try {
          // Fetch analytics
          const analytics = await getProjectAnalytics(String(project._id));
          if (analytics) {
            analyticsData[String(project._id)] = analytics as ProjectAnalyticsResponse;
          }
          
          // Fetch manager name
          const managerData = await getManagerByProject(String(project.owner));
          // If managerData is an IUser object, extract the name; otherwise use it as string
          interface UserData {
            firstName?: string;
            lastName?: string;
          }
          const managerName = typeof managerData === 'object' && managerData !== null 
            ? `${(managerData as UserData).firstName || ''} ${(managerData as UserData).lastName || ''}`.trim()
            : String(managerData || 'Unknown');
          managersData[String(project.owner)] = managerName;
        } catch (err) {
          console.error('Error fetching project data:', err);
        }
      }
      
      setAnalytics(analyticsData);
      setManagerNames(managersData);
      console.log('Analytics:', analyticsData);
      console.log('Managers:', managersData);
    }
    
    fetchProjectData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects.length]);

  const userProjects = projects.filter((project) => 
    project.team.some((teamMember) => String(teamMember) === String(user?._id))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "in-progress":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "planning":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const filteredProjects = userProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = selectedTab === "all" || project.status === selectedTab;
    return matchesSearch && matchesTab;
  });

  const stats = {
    total: userProjects.length,
    active: userProjects.filter(p => p?.status === "active").length,
    completed: userProjects.filter(p => p?.status === "completed").length,
  };

  return (
    <div className=" space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all your assigned projects
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Request Project
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.active}</div>
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

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Projects Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FolderKanban className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {project.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Badge variant="outline" className={getStatusColor(project.status)}>
                      {project.status.replace("-", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{project.progress || 0}%</span>
                    </div>
                    <Progress value={project.progress || 0} />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Tasks:</span>
                      <span className="font-medium">
                        {analytics[String(project._id)]?.completedTasks || 0}/
                        {analytics[String(project._id)]?.totalTasks || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Team:</span>
                      <span className="font-medium">{project.team?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Deadline:</span>
                      <span className="font-medium">
                        {project?.deadline 
                          ? new Date(project.deadline).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
                          : 'N/A'
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Manager:</span>
                      <span className="font-medium truncate">
                        {managerNames[String(project?.owner)] || 'Loading...'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex-1">View Details</Button>
                    <Button className="flex-1">View Tasks</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No projects found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try adjusting your search" : "You haven't been assigned to any projects yet"}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}