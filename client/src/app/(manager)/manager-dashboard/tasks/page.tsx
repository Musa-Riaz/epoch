"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjectStore } from "@/stores/project.store";
import { useAuthStore } from "@/stores/auth.store";
import { useTaskStore } from "@/stores/task.store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  CheckSquare,
  Plus,
  Search,
  Calendar,
  User,
  Flag,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";
import { IUser } from "../../../../../../server/src/infrastructure/database/models/user.model";
import toast from "react-hot-toast";
import { Label } from "@radix-ui/react-label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { IUserResponse } from "@/interfaces/api";

export default function ManagerTasks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [projectId, setProjectId] = useState<string>("");
  const [priority, setPriority] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const [taskAssignees, setTaskAssignees] = useState<
    Record<string, { firstName: string; lastName: string } | null>
  >({});
  const [members, setMembers] = useState<IUserResponse[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const tasksPerPage = 10;

  const {
    getTasksByProject,
    getTasks,
    tasks,
    getUserByTask,
    assignTask,
    createTask,
    updateTask,
    deleteTask,
  } = useTaskStore();
  const { getProjectsByManager, projects, getMembersByProject } =
    useProjectStore();
  const { user } = useAuthStore();

  useEffect(() => {
    // Fetch projects for the manager
    const fetchProjects = async () => {
      if (user?._id) {
        await getProjectsByManager(user._id);
      }
    };
    fetchProjects();
  }, [user?._id, getProjectsByManager]);

  // Fetch tasks when project selection changes
  useEffect(() => {
    const fetchTasks = async () => {
      if (selectedProject === "all") {
        await getTasks();
      } else if (selectedProject && selectedProject !== "all") {
        await getTasksByProject(selectedProject);
      }
    };
    fetchTasks();
  }, [selectedProject, getTasksByProject, getTasks]);

  // Fetch assignee information for each task
  useEffect(() => {
    const fetchAssignees = async () => {
      if (tasks.length > 0) {
        const assigneeData: Record<
          string,
          { firstName: string; lastName: string } | null
        > = {};

        for (const task of tasks) {
          if (task.assignedTo) {
            try {
              const userData = await getUserByTask(String(task.assignedTo));
              if (userData) {
                assigneeData[String(task.assignedTo)] = {
                  firstName: userData.firstName,
                  lastName: userData.lastName,
                };
              }
            } catch (error) {
              console.error(
                "Failed to fetch assignee for task:",
                task.assignedTo,
                error
              );
              assigneeData[String(task.assignedTo)] = null;
            }
          }
        }

        setTaskAssignees(assigneeData);
      }
    };

    fetchAssignees();
  }, [tasks, getUserByTask]);

  // get members by project
  useEffect(() => {
    const getMembers = async () => {
      if (selectedProject && selectedProject !== "all") {
        const res = await getMembersByProject(selectedProject);
        setMembers(res || []);
      } else if (selectedProject === "all" && projects.length > 0) {
        // Reset members first, then collect all members from all projects
        const allMembers: IUserResponse[] = [];
        const seenMemberIds = new Set<string>();

        for (const project of projects) {
          const projectMembers = await getMembersByProject(String(project._id));

          // Add members avoiding duplicates (in case a user is in multiple projects)
          if (projectMembers) {
            projectMembers.forEach((member: IUserResponse) => {
              if (!seenMemberIds.has(String(member._id))) {
                seenMemberIds.add(String(member._id));
                allMembers.push(member);
              }
            });
          }
        }

        setMembers(allMembers);
      }
    };
    getMembers();
  }, [selectedProject, getMembersByProject, projects]);

  const handleAssignTask = async (taskId: string, memberId: string) => {
    // Implement task assignment logic here
    try {
      console.log(`Assigning task ${taskId} to member ${memberId}`);
      await assignTask(taskId, memberId);
      toast.success("Task assigned successfully");
      setIsDialogOpen(false);
      setSelectedMemberId("");
      // Refresh tasks to show updated assignee
      if (selectedProject === "all") {
        await getTasks();
      } else {
        await getTasksByProject(selectedProject);
      }
    } catch {
      toast.error("Failed to assign task");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createTask({
        title,
        description,
        projectId,
        //@ts-expect-error too lazy to fix types
        priority,
        assignedTo: selectedMemberId || undefined,
      });
      if (res) toast.success("Task created successfully");
      // after creating task, refresh task list
      if (selectedProject === "all") {
        await getTasks();
      } else if (selectedProject && selectedProject !== "all") {
        await getTasksByProject(selectedProject);
      }
      // Reset form fields
      setTitle("");
      setDescription("");
      setProjectId("");
      setPriority("");
      setSelectedMemberId("");
      setStatus("");
    } catch (err) {
      console.error("Failed to create task:", err);
      toast.error("Failed to create task");
    }
  };

  const handleUpdateTask = async (e: React.FormEvent, taskId: string) => {
    e.preventDefault();
    try {
      const res = await updateTask(taskId, {
        title,
        description,
        projectId,
        //@ts-expect-error too lazy to fix types
        priority,
        assignedTo: selectedMemberId || undefined,
        //@ts-expect-error too lazy to fix types
        status,
      });
      if (res) toast.success("Task updated successfully");
      if (selectedProject === "all") {
        await getTasks();
      } else if (selectedProject && selectedProject !== "all") {
        await getTasksByProject(selectedProject);
      }
      // Reset form fields
      setTitle("");
      setDescription("");
      setProjectId("");
      setPriority("");
      setSelectedMemberId("");
      setStatus("");
    } catch (err) {
      console.log(err);
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await deleteTask(taskId);
      if (res) {
        toast.success("Task deleted successfully");
        // Refresh tasks to show updated list
        if (selectedProject === "all") {
          await getTasks();
        } else {
          await getTasksByProject(selectedProject);
        }
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to delete task");
    }
  };

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

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTab = selectedTab === "all" || task.status === selectedTab;
    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter;
    // Note: assignedTo is an ObjectId, will need to be populated from backend
    const matchesAssignee = assigneeFilter === "all";
    return matchesSearch && matchesTab && matchesPriority && matchesAssignee;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
  const startIndex = (currentPage - 1) * tasksPerPage;
  const endIndex = startIndex + tasksPerPage;
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTab, searchQuery, priorityFilter, assigneeFilter, selectedProject]);

  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  // Note: assignedTo is ObjectId, will need backend to populate user data
  const assignees: string[] = [];

  return (
    <div className=" space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Task Management</h1>
          <p className="text-muted-foreground mt-1">
            Create, assign, and monitor tasks across all projects
          </p>
        </div>
        <div className="flex flex-row gap-2">
          <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold ">
                  Create New Task
                </DialogTitle>
                <DialogDescription className="py-0">
                  Fill in the details below to create a new task.
                </DialogDescription>
              </DialogHeader>

              {/* Task creation form goes here */}

              <form className="space-y-4 ">
                <div className="space-y-2 ">
                  <Label className="text-lg font-semibold">Enter Title</Label>
                  <Input
                    type="text"
                    placeholder="Task Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2 ">
                  <Label className="text-lg font-semibold">
                    Enter Description
                  </Label>
                  <Input
                    type="text"
                    placeholder="Task Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2 ">
                  <Label className="text-lg font-semibold">
                    Select the Project
                  </Label>
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select the Project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem
                          key={String(project._id)}
                          value={String(project._id)}
                        >
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 grid grid-cols-2 gap-2">
                  <div className="w-full">
                    <Label className="text-lg font-semibold">
                      Select Team Member
                    </Label>
                    <Select
                      value={selectedMemberId}
                      onValueChange={setSelectedMemberId}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a team member" />
                      </SelectTrigger>
                      <SelectContent>
                        {members?.map((member) => (
                          <SelectItem
                            key={String(member._id)}
                            value={String(member._id)}
                          >
                            {member.firstName} {member.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full">
                    <Label className="text-lg font-semibold">
                      Select Priority
                    </Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-lg font-semibold">Select Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full ">
                  <div className="flex flex-row gap-2 justify-end mt-2">
                    <DialogClose>
                      <Button
                        className="border hover:cursor-pointer"
                        type="button"
                        variant="secondary"
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      type="submit"
                      className="hover:cursor-pointer"
                      onClick={(e) => {
                        handleCreateTask(e);
                        setIsTaskDialogOpen(false);
                      }}
                      disabled={!priority}
                    >
                      Create Task
                    </Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="">
              <SelectValue placeholder="Filter by Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {Array.isArray(projects) && projects.length > 0 ? (
                projects.map((project) => (
                  <SelectItem
                    key={String(project._id)}
                    value={String(project._id)}
                  >
                    {project.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  No projects available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
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
            <div className="text-2xl font-bold text-yellow-500">
              {stats.todo}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {stats.inProgress}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Done
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {stats.done}
            </div>
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
        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Members</SelectItem>
            {assignees.map((assignee) => (
              <SelectItem key={assignee} value={assignee}>
                {assignee}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tasks */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="todo">To Do</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="done">Done</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6 space-y-4 ">

          {paginatedTasks.map((task) => (
            <Card
              key={String(task?._id)}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="pt-1">{getStatusIcon(task.status)}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{task.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {task.description}
                        </CardDescription>
                      </div>
                      <Flag
                        className={`w-5 h-5 ${getPriorityColor(task.priority)}`}
                      />
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge
                        variant="outline"
                        className={getStatusColor(task.status)}
                      >
                        {task.status.replace("-", " ")}
                      </Badge>
                      <Badge variant="outline">{task.priority} priority</Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-4 h-4" />
                        <span>Project ID: {String(task.projectId)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-4 h-4" />
                        <span>Project Name: {String(task.title)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>
                          Assigned To:
                          {taskAssignees[String(task.assignedTo)]
                            ? ` ${
                                taskAssignees[String(task.assignedTo)]
                                  ?.firstName
                              } ${
                                taskAssignees[String(task.assignedTo)]?.lastName
                              }`
                            : task.assignedTo 
                            ? "Unassigned"
                            : " Loading..."}
                        </span>
                      </div>
                      {task.dueDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Due:{" "}
                            {new Date(task.dueDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant={"destructive"} size={"sm"}>
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete your account and remove your
                              data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleDeleteTask(String(task?._id))
                              }
                            >
                              Continue
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Dialog
                        open={
                          isTaskDialogOpen && currentTaskId === String(task._id)
                        }
                        onOpenChange={(open) => {
                          setIsTaskDialogOpen(open);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="text-xl font-bold ">
                              Update Task
                            </DialogTitle>
                            <DialogDescription>
                              Edit Task Details.
                            </DialogDescription>
                          </DialogHeader>

                          <form className="space-y-4 ">
                            <div className="space-y-2 ">
                              <Label className="text-lg font-semibold">
                                Update Title
                              </Label>
                              <Input
                                type="text"
                                placeholder={task?.title}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2 ">
                              <Label className="text-lg font-semibold">
                                Update Description
                              </Label>
                              <Input
                                type="text"
                                placeholder={task?.description}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2 ">
                              <Label className="text-lg font-semibold">
                                Update the Project
                              </Label>
                              <Select
                                value={projectId}
                                onValueChange={setProjectId}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select the Project" />
                                </SelectTrigger>
                                <SelectContent>
                                  {projects.map((project) => (
                                    <SelectItem
                                      key={String(project._id)}
                                      value={String(project._id)}
                                    >
                                      {project.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2 grid grid-cols-2 gap-2">
                              <div className="w-full">
                                <Label className="text-lg font-semibold">
                                  Select Team Member
                                </Label>
                                <Select
                                  value={String(task?.assignedTo)}
                                  onValueChange={setSelectedMemberId}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a team member" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {members?.map((member) => (
                                      <SelectItem
                                        key={String(member._id)}
                                        value={String(member._id)}
                                      >
                                        {member.firstName} {member.lastName}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="w-full">
                                <Label className="text-lg font-semibold">
                                  Select Priority
                                </Label>
                                <Select
                                  value={task?.priority}
                                  onValueChange={setPriority}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a priority" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">
                                      Medium
                                    </SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-lg font-semibold">
                                Select Status
                              </Label>
                              <Select
                                value={task.status}
                                onValueChange={setStatus}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="todo">To Do</SelectItem>
                                  <SelectItem value="in-progress">
                                    In Progress
                                  </SelectItem>
                                  <SelectItem value="done">Done</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="w-full ">
                              <div className="flex flex-row gap-2 justify-end mt-2">
                                <DialogClose>
                                  <Button
                                    className="border hover:cursor-pointer"
                                    type="button"
                                    variant="secondary"
                                  >
                                    Cancel
                                  </Button>
                                </DialogClose>
                                <Button
                                  type="submit"
                                  className="hover:cursor-pointer"
                                  onClick={(e) => {
                                    handleUpdateTask(e, String(task?._id));
                                    setIsTaskDialogOpen(false);
                                  }}
                                >
                                  Edit Task
                                </Button>
                              </div>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                      <Dialog
                        open={
                          isDialogOpen && currentTaskId === String(task._id)
                        }
                        onOpenChange={(open) => {
                          setIsDialogOpen(open);
                          if (open) {
                            setCurrentTaskId(String(task._id));
                            setSelectedMemberId("");
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Reassign
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reassign Task</DialogTitle>
                            <DialogDescription>
                              Select a team member to reassign this task to.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Team Member
                              </label>
                              <Select
                                value={selectedMemberId}
                                onValueChange={setSelectedMemberId}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a team member" />
                                </SelectTrigger>
                                <SelectContent>
                                  {members?.map((member) => (
                                    <SelectItem
                                      key={String(member._id)}
                                      value={String(member._id)}
                                    >
                                      {member.firstName} {member.lastName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <DialogClose asChild>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedMemberId("");
                                  setIsDialogOpen(false);
                                }}
                              >
                                Cancel
                              </Button>
                            </DialogClose>
                            <Button
                              onClick={() =>
                                handleAssignTask(
                                  String(task._id),
                                  selectedMemberId
                                )
                              }
                              disabled={!selectedMemberId}
                            >
                              Reassign
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button size="sm">View Details</Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}

          {/* Pagination Controls */}
          {filteredTasks.length > tasksPerPage && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredTasks.length)} of {filteredTasks.length} tasks
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <div className="text-sm font-medium px-3">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
              <p className="text-muted-foreground">
                {selectedProject !== "all"
                  ? "No tasks for this project. Create a new task or select a different project."
                  : "Try adjusting your filters or create a new task."}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
