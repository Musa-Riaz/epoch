"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle
} from "lucide-react";

// Mock data
const reportData = {
  period: "October 2025",
  projects: {
    total: 12,
    active: 8,
    completed: 3,
    onHold: 1
  },
  tasks: {
    total: 234,
    completed: 156,
    inProgress: 67,
    overdue: 11
  },
  team: {
    members: 15,
    avgProductivity: 86,
    topPerformer: "Emily Rodriguez"
  }
};

const weeklyProgress = [
  { week: "Week 1", tasksCompleted: 42, hoursWorked: 160 },
  { week: "Week 2", tasksCompleted: 38, hoursWorked: 155 },
  { week: "Week 3", tasksCompleted: 45, hoursWorked: 165 },
  { week: "Week 4", tasksCompleted: 31, hoursWorked: 140 }
];

const projectReports = [
  { name: "E-Commerce Platform", status: "on-track", budget: 85000, spent: 52000, completion: 65 },
  { name: "Mobile App Redesign", status: "at-risk", budget: 45000, spent: 32000, completion: 40 },
  { name: "API Integration", status: "completed", budget: 30000, spent: 28500, completion: 100 }
];

export default function ManagerReports() {
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Generate and download comprehensive reports
          </p>
        </div>
        <Button className="gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Period Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Report Period</CardTitle>
              <CardDescription>Currently viewing: {reportData.period}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Projects Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Projects</span>
              <span className="font-bold">{reportData.projects.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-500">Active</span>
              <span className="font-bold text-blue-500">{reportData.projects.active}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-500">Completed</span>
              <span className="font-bold text-green-500">{reportData.projects.completed}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Tasks Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Tasks</span>
              <span className="font-bold">{reportData.tasks.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-500">Completed</span>
              <span className="font-bold text-green-500">{reportData.tasks.completed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-red-500">Overdue</span>
              <span className="font-bold text-red-500">{reportData.tasks.overdue}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Team Members</span>
              <span className="font-bold">{reportData.team.members}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Avg Productivity</span>
              <span className="font-bold text-green-500">{reportData.team.avgProductivity}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Top Performer</span>
              <span className="font-bold">{reportData.team.topPerformer}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="weekly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="weekly">Weekly Progress</TabsTrigger>
          <TabsTrigger value="projects">Project Reports</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
        </TabsList>

        {/* Weekly Progress */}
        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Progress Report</CardTitle>
              <CardDescription>Task completion and hours worked per week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {weeklyProgress.map((week, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{week.week}</span>
                      <div className="flex gap-6 text-sm">
                        <span className="text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 inline mr-1" />
                          {week.tasksCompleted} tasks
                        </span>
                        <span className="text-muted-foreground">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {week.hoursWorked} hours
                        </span>
                      </div>
                    </div>
                    <Progress value={(week.tasksCompleted / 50) * 100} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Project Reports */}
        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Project Financial Reports</CardTitle>
              <CardDescription>Budget tracking and completion status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {projectReports.map((project, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ${project.spent.toLocaleString()} of ${project.budget.toLocaleString()} spent
                        </div>
                      </div>
                      <Badge variant="outline" className={
                        project.status === "completed" ? "bg-green-500/10 text-green-500" :
                        project.status === "at-risk" ? "bg-yellow-500/10 text-yellow-500" :
                        "bg-blue-500/10 text-blue-500"
                      }>
                        {project.status}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Budget Used</span>
                        <span>{Math.round((project.spent / project.budget) * 100)}%</span>
                      </div>
                      <Progress value={(project.spent / project.budget) * 100} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Completion</span>
                        <span>{project.completion}%</span>
                      </div>
                      <Progress value={project.completion} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Metrics */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Key performance indicators and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Task Completion Rate</span>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-green-500 font-bold">78%</span>
                    </div>
                  </div>
                  <Progress value={78} />
                  <p className="text-sm text-muted-foreground">
                    5% increase from last month
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">On-Time Delivery</span>
                    <span className="font-bold text-blue-500">85%</span>
                  </div>
                  <Progress value={85} />
                  <p className="text-sm text-muted-foreground">
                    Meeting 85% of project deadlines
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Team Efficiency</span>
                    <span className="font-bold text-purple-500">92%</span>
                  </div>
                  <Progress value={92} />
                  <p className="text-sm text-muted-foreground">
                    High team productivity and collaboration
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Bug Resolution Time</span>
                    <span className="font-bold">2.3 days</span>
                  </div>
                  <Progress value={70} />
                  <p className="text-sm text-muted-foreground">
                    0.5 days faster than average
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
          <CardDescription>Download reports in various formats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="gap-2">
              <FileText className="w-4 h-4" />
              Export as PDF
            </Button>
            <Button variant="outline" className="gap-2">
              <FileText className="w-4 h-4" />
              Export as Excel
            </Button>
            <Button variant="outline" className="gap-2">
              <FileText className="w-4 h-4" />
              Export as CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
