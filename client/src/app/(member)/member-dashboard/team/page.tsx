"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Search, 
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock
} from "lucide-react";

// Mock data - replace with actual API calls
const mockTeamMembers = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "manager",
    email: "sarah.johnson@company.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    avatar: "",
    department: "Engineering",
    joinDate: "2023-01-15",
    projects: ["E-Commerce Platform", "API Integration"],
    tasksCompleted: 127,
    tasksInProgress: 8,
    skills: ["Project Management", "Agile", "Team Leadership"],
    availability: "available"
  },
  {
    id: 2,
    name: "Mike Chen",
    role: "manager",
    email: "mike.chen@company.com",
    phone: "+1 (555) 234-5678",
    location: "San Francisco, CA",
    avatar: "",
    department: "Design",
    joinDate: "2023-03-20",
    projects: ["Mobile App Redesign"],
    tasksCompleted: 89,
    tasksInProgress: 5,
    skills: ["UI/UX", "Product Design", "User Research"],
    availability: "available"
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "member",
    email: "emily.rodriguez@company.com",
    phone: "+1 (555) 345-6789",
    location: "Austin, TX",
    avatar: "",
    department: "Engineering",
    joinDate: "2024-02-10",
    projects: ["E-Commerce Platform", "Dashboard Analytics"],
    tasksCompleted: 45,
    tasksInProgress: 6,
    skills: ["React", "Node.js", "TypeScript"],
    availability: "available"
  },
  {
    id: 4,
    name: "David Kim",
    role: "manager",
    email: "david.kim@company.com",
    phone: "+1 (555) 456-7890",
    location: "Seattle, WA",
    avatar: "",
    department: "Engineering",
    joinDate: "2022-11-05",
    projects: ["Dashboard Analytics"],
    tasksCompleted: 156,
    tasksInProgress: 4,
    skills: ["Backend", "DevOps", "Cloud Architecture"],
    availability: "busy"
  },
  {
    id: 5,
    name: "Jessica Martinez",
    role: "member",
    email: "jessica.martinez@company.com",
    phone: "+1 (555) 567-8901",
    location: "Chicago, IL",
    avatar: "",
    department: "Design",
    joinDate: "2024-05-15",
    projects: ["Mobile App Redesign"],
    tasksCompleted: 23,
    tasksInProgress: 7,
    skills: ["Figma", "Illustration", "Animation"],
    availability: "available"
  },
  {
    id: 6,
    name: "Tom Anderson",
    role: "member",
    email: "tom.anderson@company.com",
    phone: "+1 (555) 678-9012",
    location: "Boston, MA",
    avatar: "",
    department: "Engineering",
    joinDate: "2023-08-22",
    projects: ["API Integration", "E-Commerce Platform"],
    tasksCompleted: 78,
    tasksInProgress: 5,
    skills: ["API Development", "Python", "Database Design"],
    availability: "available"
  }
];

export default function TeamPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "manager":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "member":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available":
        return "bg-green-500";
      case "busy":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const filteredMembers = mockTeamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === "all" || member.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: mockTeamMembers.length,
    managers: mockTeamMembers.filter(m => m.role === "manager").length,
    members: mockTeamMembers.filter(m => m.role === "member").length,
    available: mockTeamMembers.filter(m => m.availability === "available").length
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Team</h1>
          <p className="text-muted-foreground mt-1">
            Connect and collaborate with your team members
          </p>
        </div>
        <Button className="gap-2">
          <Users className="w-4 h-4" />
          View All Teams
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Managers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">{stats.managers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.members}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.available}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Team Tabs */}
      <Tabs value={selectedRole} onValueChange={setSelectedRole}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="manager">Managers</TabsTrigger>
          <TabsTrigger value="member">Members</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedRole} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback className="text-lg">
                          {member.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-background ${getAvailabilityColor(member.availability)}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {member.department}
                      </CardDescription>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className={getRoleBadgeColor(member.role)}>
                          {member.role}
                        </Badge>
                        <Badge variant="outline">
                          {member.availability}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{member.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{member.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {new Date(member.joinDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Completed</span>
                      </div>
                      <div className="text-xl font-bold">{member.tasksCompleted}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>In Progress</span>
                      </div>
                      <div className="text-xl font-bold text-blue-500">{member.tasksInProgress}</div>
                    </div>
                  </div>

                  {/* Projects */}
                  <div className="space-y-2 pt-2 border-t">
                    <div className="text-sm font-medium">Projects</div>
                    <div className="flex flex-wrap gap-2">
                      {member.projects.map((project) => (
                        <Badge key={project} variant="secondary">
                          {project}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="space-y-2 pt-2 border-t">
                    <div className="text-sm font-medium">Skills</div>
                    <div className="flex flex-wrap gap-2">
                      {member.skills.map((skill) => (
                        <Badge key={skill} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex-1">
                      <Mail className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="outline" className="flex-1">
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No team members found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try adjusting your search" : "No team members available"}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
