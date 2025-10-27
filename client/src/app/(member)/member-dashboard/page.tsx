"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TaskCard from "@/components/cards/TaskCard";
import { SortableContext} from '@dnd-kit/sortable'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Filter,
  Share2,
  Grid3x3
} from "lucide-react";
import { closestCorners, DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, useDroppable } from "@dnd-kit/core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import {Label} from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea";
import { DialogClose } from "@radix-ui/react-dialog";
import { useTaskStore } from "@/stores/task.store";
import { toast } from "react-hot-toast";
import { useProjectStore } from "@/stores/project.store";
import { useAuthStore } from "@/stores/auth.store";
import { SelectValue } from "@radix-ui/react-select";

type Task = {
    id: string;
    priority: "low" | "medium" | "high" ;
    title: string;
    description: string;
    status: 'todo' | 'inProgress' | 'done';
    media?: File 
}

// Droppable wrapper component
const DroppableColumn = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const { setNodeRef } = useDroppable({ id });
  
  return (
    <div ref={setNodeRef} className="space-y-3 min-h-[200px]">
      {children}
    </div>
  );
};


const MemberDashboard = () => {

  
  const [tasks, setTasks] = useState<Task[]>([]);
  const { getTasks, getTasksByProject } = useTaskStore();
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const {projects, getProjectsByMember} = useProjectStore();
  const { user } = useAuthStore();

    // calling useEffect, fetching tasks from getTasks, and setting tasks
    // TODO: fetch the tasks according to the specific project id

    // fetching the prijects of which the user is a part of 
    useEffect(() => {

      const fetchProjects = async () => {
        try{
          await getProjectsByMember(String(user?._id));
        }
        catch(err){
          console.log(err);
        }
      }
      fetchProjects();

    }, [user?._id, getProjectsByMember]);

    useEffect(() => {
  async function fetchTasks(){

        try{

          if(selectedProject === 'all'){
            const res = await getTasks();
            if(res){
            // Map ITaskResponse[] to Task[] format
            const mappedTasks: Task[] = res.map((taskResponse) => {
              const task = taskResponse;

              return {
                id: String(task._id),
                priority: task.priority,
                title: task.title,
                description: task.description || '',
                status: task.status === 'in-progress' ? 'inProgress' : task.status as 'todo' | 'done',
              };
            });
            setTasks(mappedTasks);
          }
          }

          else {
            const res = await getTasksByProject(String(selectedProject));
            if(res){
              const mappedTasks: Task[] = res.map((taskResponse) => {
                const task = taskResponse;

                return {
                  id: String(task._id),
                  priority: task.priority,
                  title: task.title,
                  description: task.description || '',
                  status: task.status === 'in-progress' ? 'inProgress' : task.status as 'todo' | 'done',
                };
              });
              setTasks(mappedTasks);
            }
          }
        }
        catch(err){
          console.log(err)
          toast.error('Failed to fetch tasks');
        }
      }
      fetchTasks();
    }, [selectedProject, getTasks, getTasksByProject]);

    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [media] = useState<File | null>(null);

    const { createTask, updateTask } = useTaskStore();

    // Configure sensors for better drag experience
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px of movement required to start drag
            },
        })
    );

    // Get tasks by status
    const todoTasks = tasks?.filter(task => task?.status === 'todo');
    const inProgressTasks = tasks?.filter(task => task.status === 'inProgress');
    const doneTasks = tasks?.filter(task => task.status === 'done');

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const activeTask = tasks?.find(task => task.id === active.id);
        setActiveTask(activeTask || null);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        
        if (!over || !tasks) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const activeTask = tasks.find(t => t.id === activeId);
        const overTask = tasks.find(t => t.id === overId);

        if (!activeTask) return;

        // Only handle reordering within the same column, not status changes
        // Status changes will be handled in handleDragEnd
        if (overTask && activeTask.status === overTask.status) {
            setTasks(tasks => {
                if (!tasks) return tasks;
                const activeIndex = tasks.findIndex(t => t.id === activeId);
                const overIndex = tasks.findIndex(t => t.id === overId);
                
                if (activeIndex === -1 || overIndex === -1) return tasks;
                
                const newTasks = [...tasks];
                const [movedTask] = newTasks.splice(activeIndex, 1);
                newTasks.splice(overIndex, 0, movedTask);
                
                return newTasks;
            });
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        
        setActiveTask(null);

        if (!over || !tasks) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const activeTask = tasks.find(t => t.id === activeId);
        if (!activeTask) return;

        // Determine the new status
        let newStatus: 'todo' | 'inProgress' | 'done' | null = null;
        
        // Check if dropped over a column
        const isOverColumn = ['todo', 'inProgress', 'done'].includes(overId as string);
        if (isOverColumn) {
            newStatus = overId as 'todo' | 'inProgress' | 'done';
        } else {
            // Dropped over another task
            const overTask = tasks.find(t => t.id === overId);
            if (overTask && activeTask.status !== overTask.status) {
                newStatus = overTask.status;
            }
        }

        

        // If status changed, update the database
        if (newStatus && newStatus !== activeTask.status) {
            try {
                // Convert frontend status to backend status
                const backendStatus = newStatus === 'inProgress' ? 'in-progress' : newStatus;
                
                console.log('Updating task status:', {
                    taskId: activeId,
                    oldStatus: activeTask.status,
                    newStatus: newStatus,
                    backendStatus: backendStatus
                });
                
                // Update in database
                const result = await updateTask(String(activeId), { status: backendStatus });
                console.log('Update result:', result);
                
                // Update local state
                setTasks(tasks => {
                    if (!tasks) return tasks;
                    const activeIndex = tasks.findIndex(t => t.id === activeId);
                    if (activeIndex === -1) return tasks;
                    
                    const newTasks = [...tasks];
                    newTasks[activeIndex] = {
                        ...newTasks[activeIndex],
                        status: newStatus as 'todo' | 'inProgress' | 'done'
                    };
                    return newTasks;
                });
                
                toast.success("Task status updated");
            } catch (error) {
                toast.error("Failed to update task status");
                console.error('Update error:', error);
            }
        } else {
            // Just reordering within the same column
            setTasks(tasks => {
                if (!tasks) return tasks;
                const activeTask = tasks.find(t => t.id === activeId);
                const overTask = tasks.find(t => t.id === overId);

                if (!activeTask) return tasks;

                const activeIndex = tasks.findIndex(t => t.id === activeId);
                const overIndex = tasks.findIndex(t => t.id === overId);

                if (activeIndex === -1 || overIndex === -1) return tasks;

                // If dropping in the same column, just reorder
                if (activeTask.status === overTask?.status) {
                    const newTasks = [...tasks];
                    const [movedTask] = newTasks.splice(activeIndex, 1);
                    newTasks.splice(overIndex, 0, movedTask);
                    return newTasks;
                }

                return tasks;
            });
        }
    };


    const handleAddTask = async (status : 'todo' | 'in-progress' | 'done') : Promise<void> => {
       try {
      const res = await createTask({
          projectId: '68f3bb9f6e9169a633a0ffe1', // For testing purposes
          status,
          title,
          description,
          priority,
          media,
        })
        if(res){
          // Add the new task to local state immediately
          const newTask: Task = {
            id: String(res._id),
            priority: res.priority,
            title: res.title,
            description: res.description || '',
            status: res.status === 'in-progress' ? 'inProgress' : res.status as 'todo' | 'done',
          };
          setTasks(prevTasks => [...prevTasks, newTask]);
          
          // Clear form fields
          setTitle('');
          setDescription('');
          setPriority('medium');
          
          toast.success("Task created successfully")
        }
       }
       catch (err: unknown) {
      if (err instanceof Error) {
        const axiosError = err as { response?: { data?: { error?: string } } };
        const responseError = axiosError.response?.data?.error;
        toast.error(responseError ?? err.message);
      } else {
        toast.error(String(err));
      }
    }
    }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className=" border-none py-8" >
                <SelectValue placeholder="Select Project" >
                  <h1 className="text-3xl font-bold p-2">
                  {selectedProject === 'all' 
                    ? 'All Projects' 
                    : projects.find(p => String(p._id) === selectedProject)?.name || 'Select Project'
                  }
                  </h1>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={String(project._id)} value={String(project._id)}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCorners} 
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* To Do Column */}
            <div className="space-y-4 dark:bg-[#1e1e2f] bg-[#f5f5f5] rounded-xl p-3">
              <div className="flex flex-col">
                <div className="flex flex-row items-center justify-between">
                       <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <h3 className="font-semibold">To Do</h3>
                  <Badge variant="secondary" className="rounded-full">{todoTasks?.length}</Badge>
                </div>
                  <Dialog>
                    <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:cursor-pointer">
                      <Plus className="h-4 w-4 " />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Task</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-1 gap-2 space-y-4">
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="task-title">Task Title</Label>
                          <Input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Enter task title..." />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="task-details">Task Details</Label>
                          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter task details..." />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="task-priority">Task Priority</Label>
                          <Select  defaultValue={priority} onValueChange={(value) => setPriority(value as 'low' | 'medium' | 'high')}>
                            <SelectTrigger className="w-full">Select Priority</SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="task-assignee">Upload File</Label>
                          <Input type="file" id="task-assignee" />
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button variant='secondary' className="">
                            <DialogClose>Close</DialogClose>
                          </Button>
                          <Button onClick={() => handleAddTask('todo')}>
                           Add Task
                            </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
             
                <div className="w-full h-2 rounded-full mt-4 bg-blue-500" />
              </div>

              <SortableContext items={todoTasks?.map(t => t.id) || []}>
                <DroppableColumn id="todo">
                  {todoTasks?.map((task) => (
                    <TaskCard
                      key={task.id}
                      id={task.id}
                      priority={task.priority}
                      title={task.title}
                      description={task.description}
                    />
                  ))}
                </DroppableColumn>
              </SortableContext>
            </div>

            {/* In Progress Column */}
            <div className="space-y-4 dark:bg-[#1e1e2f] bg-[#f5f5f5] rounded-xl p-3">
           <div className="flex flex-col">
                <div className="flex flex-row items-center justify-between">
                       <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <h3 className="font-semibold">In Progress</h3>
                  <Badge variant="secondary" className="rounded-full">{inProgressTasks?.length}</Badge>
                </div>
                                <Dialog>
                    <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:cursor-pointer">
                      <Plus className="h-4 w-4 " />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Task</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-1 gap-2 space-y-4">
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="task-title">Task Title</Label>
                          <Input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Enter task title..." />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="task-details">Task Details</Label>
                          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter task details..." />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="task-priority">Task Priority</Label>
                          <Select  defaultValue={priority} onValueChange={(value) => setPriority(value as 'low' | 'medium' | 'high')}>
                            <SelectTrigger className="w-full">Select Priority</SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="task-assignee">Upload File</Label>
                          <Input type="file" id="task-assignee" />
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button variant='secondary' className="">
                            <DialogClose>Close</DialogClose>
                          </Button>
                          <Button onClick={() => handleAddTask('in-progress')}>
                           Add Task
                            </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
             
                <div className="w-full h-2 rounded-full mt-4 bg-yellow-500" />
              </div>

              <SortableContext items={inProgressTasks?.map(t => t.id) || []}>
                <DroppableColumn id="inProgress">
                  {inProgressTasks?.map((task) => (
                    <TaskCard
                      key={task.id}
                      id={task.id}
                      priority={task.priority}
                      title={task.title}
                      description={task.description}
                    />
                  ))}
                </DroppableColumn>
              </SortableContext>
            </div>

            {/* Done Column */}
            <div className="space-y-4 dark:bg-[#1e1e2f] bg-[#f5f5f5] rounded-xl p-3">
            <div className="flex flex-col">
                <div className="flex flex-row items-center justify-between">
                       <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <h3 className="font-semibold">Done</h3>
                  <Badge variant="secondary" className="rounded-full">{doneTasks?.length}</Badge>
                </div>
                                  <Dialog>
                    <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:cursor-pointer">
                      <Plus className="h-4 w-4 " />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Task</DialogTitle>
                      </DialogHeader>
                       <div className="grid grid-cols-1 gap-2 space-y-4">
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="task-title">Task Title</Label>
                          <Input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Enter task title..." />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="task-details">Task Details</Label>
                          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter task details..." />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="task-priority">Task Priority</Label>
                          <Select  defaultValue={priority} onValueChange={(value) => setPriority(value as 'low' | 'medium' | 'high')}>
                            <SelectTrigger className="w-full">Select Priority</SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="task-assignee">Upload File</Label>
                          <Input type="file" id="task-assignee" />
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button variant='secondary' className="">
                            <DialogClose>Close</DialogClose>
                          </Button>
                          <Button onClick={() => handleAddTask('done')}>
                           Add Task
                            </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
             
                <div className="w-full h-2 rounded-full mt-4 bg-green-500" />
              </div>

              <SortableContext items={doneTasks?.map(t => t.id) || []}>
                <DroppableColumn id="done">
                  {doneTasks?.map((task) => (
                    <TaskCard
                      key={task.id}
                      id={task.id}
                      priority={task.priority}
                      title={task.title}
                      description={task.description}
                    />
                  ))}
                </DroppableColumn>
              </SortableContext>
            </div>
          </div>

          <DragOverlay>
            {activeTask ? (
              <TaskCard
                id={activeTask.id}
                priority={activeTask.priority}
                title={activeTask.title}
                description={activeTask.description}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </>
  );
};

export default MemberDashboard;