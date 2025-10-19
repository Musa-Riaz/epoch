"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaskCard from "@/components/cards/TaskCard";
import {arrayMove, SortableContext} from '@dnd-kit/sortable'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  MoreVertical, 
  Calendar, 
  MessageSquare, 
  Paperclip,
  Filter,
  Share2,
  Grid3x3
} from "lucide-react";
import Image from "next/image";
import { closestCorners, DndContext } from "@dnd-kit/core";

type Task = {
    id: number;
    priority: string;
    title: string;
    description: string;
}



const MemberDashboard = () => {
    const [tasks, setTasks] = useState<Task[]>([
    {
    id: 1,
    priority:'low',
    title:'Design',
    description:'asdasdasdasdasdasd'
},
    {
    id: 2,
    priority:'low',
    title:'Design',
    description:'asdasdasdasdasdasd'
},
    {
    id: 3,
    priority:'low',
    title:'Design',
    description:'asdasdasdasdasdasd'
},
    {
    id: 4,
    priority:'low',
    title:'Design',
    description:'asdasdasdasdasdasd'
},


])


   const getTasksPos = (id: number) => {
    return tasks.findIndex((task) => task.id === id)
   }

    const handleDragEvent = (event) => {
        const {active, over} = event
        if(active.id === over.id) return ;

        setTasks((tasks) => {
            const originalPos = getTasksPos(active.id)
            const newPos = getTasksPos(over.id);

            return arrayMove(tasks, originalPos, newPos);
        })
        

    }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mobile App</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage your project tasks
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Today
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Today</DropdownMenuItem>
                <DropdownMenuItem>This Week</DropdownMenuItem>
                <DropdownMenuItem>This Month</DropdownMenuItem>
                <DropdownMenuItem>Custom Range</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Invite
            </Button>
            <Button variant="outline" size="icon">
              <Grid3x3 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Team Members */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Avatar key={i} className="border-2 border-background w-8 h-8">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs">
                  U{i}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <Button variant="outline" size="sm" className="rounded-full h-8 w-8 p-0 text-lg">
            +12
          </Button>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* To Do Column */}
        <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEvent}>
           
          <div className="space-y-4 bg-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <h3 className="font-semibold">To Do</h3>
                <Badge variant="secondary" className="rounded-full">4</Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">


<SortableContext items={tasks} >
                {tasks?.map((task) => (
                    <TaskCard
                    key={task.id}
                    id={task.id}
                    priority={task.priority}
                    title={task.title}
                    description={task.description}
                    />
                ))}
                </SortableContext>

            </div>
          </div>
          </DndContext>

          {/* On Progress Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <h3 className="font-semibold">On Progress</h3>
                <Badge variant="secondary" className="rounded-full">3</Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {/* Task Card */}
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Badge variant="secondary" className="text-xs">Low</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                        <DropdownMenuItem>Move to...</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className="text-base font-semibold mt-2">
                    Onboarding Illustrations
                  </CardTitle>
                  <div className="mt-3">
                    <Image
                    width={300}
                    height={200} 
                      src="/api/placeholder/300/150" 
                      alt="Onboarding" 
                      className="rounded-md w-full h-32 object-cover"
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-1">
                        {[1, 2].map((i) => (
                          <Avatar key={i} className="border-2 border-background w-6 h-6">
                            <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-600 text-white text-xs">
                              {i}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span className="text-xs">14 comments</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Paperclip className="h-3 w-3" />
                      <span className="text-xs">15 files</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Task Card 2 */}
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Badge variant="secondary" className="text-xs">Low</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                        <DropdownMenuItem>Move to...</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className="text-base font-semibold mt-2">
                    Moodboard
                  </CardTitle>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <img 
                      src="/api/placeholder/150/100" 
                      alt="Mood 1" 
                      className="rounded-md w-full h-20 object-cover"
                    />
                    <img 
                      src="/api/placeholder/150/100" 
                      alt="Mood 2" 
                      className="rounded-md w-full h-20 object-cover"
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <Avatar className="border-2 border-background w-6 h-6">
                        <AvatarFallback className="bg-gradient-to-br from-pink-400 to-red-600 text-white text-xs">
                          1
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span className="text-xs">9 comments</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Paperclip className="h-3 w-3" />
                      <span className="text-xs">10 files</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Done Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <h3 className="font-semibold">Done</h3>
                <Badge variant="secondary" className="rounded-full">2</Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {/* Task Card */}
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-green-200 dark:border-green-900">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Badge className="text-xs bg-green-500">Completed</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                        <DropdownMenuItem>Move to...</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className="text-base font-semibold mt-2">
                    Mobile App Design
                  </CardTitle>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <img 
                      src="/api/placeholder/150/100" 
                      alt="Design 1" 
                      className="rounded-md w-full h-20 object-cover"
                    />
                    <img 
                      src="/api/placeholder/150/100" 
                      alt="Design 2" 
                      className="rounded-md w-full h-20 object-cover"
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-1">
                        {[1, 2].map((i) => (
                          <Avatar key={i} className="border-2 border-background w-6 h-6">
                            <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-600 text-white text-xs">
                              {i}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span className="text-xs">12 comments</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Paperclip className="h-3 w-3" />
                      <span className="text-xs">15 files</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Task Card 2 */}
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-green-200 dark:border-green-900">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Badge className="text-xs bg-green-500">Completed</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                        <DropdownMenuItem>Move to...</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className="text-base font-semibold mt-2">
                    Design System
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    It just needs to adapt the UI from what you did before
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-1">
                        {[1, 2, 3].map((i) => (
                          <Avatar key={i} className="border-2 border-background w-6 h-6">
                            <AvatarFallback className="bg-gradient-to-br from-teal-400 to-cyan-600 text-white text-xs">
                              {i}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span className="text-xs">12 comments</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Paperclip className="h-3 w-3" />
                      <span className="text-xs">15 files</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MemberDashboard;