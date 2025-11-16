import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { MessageSquare, MoreVertical, Paperclip } from "lucide-react";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useCommentStore } from "@/stores/comment.store";
import { useEffect, useState } from "react";
import { Textarea } from "../ui/textarea";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/auth.store";

interface TaskCardProps {
  id: string;
  priority: string;
  title: string;
  description: string;
}

const TaskCard = ({ id, priority, title, description }: TaskCardProps) => {
  const { getCommentsByTask, commentsByTask, createComment } =
    useCommentStore();
  const [taskCommentClicked, setTaskCommentClicked] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const {getUserById} = useAuthStore();
  useEffect(() => {
    getCommentsByTask(id);
  }, [id, getCommentsByTask]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transition,
    transform,
    isDragging,
  } = useSortable({ id });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    boxShadow: isDragging
      ? priority === "low"
        ? "0 4px 8px rgba(90, 219, 78, 0.837)"
        : priority === "medium"
        ? "0 4px 8px rgba(255, 193, 7, 0.837)"
        : "0 4px 8px rgba(220, 38, 38, 0.837)"
      : "none",
  };

  const handleAddComment = async (taskId: string) => {
    try {
      if (commentContent.trim() === "") return;
      await createComment({ content: commentContent, taskId });
      toast.success("Comment added successfully");
      setCommentContent("");
    } catch (err) {
      toast.error("Failed to add comment. Please try again.");
      console.log(err);
    }
  };

  // fetch user intials for avatar
  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     for (const comment of commentsByTask[id] || []) {
  //       await getUserById(String(comment.authorId));
  //     }
  //   }
  //   fetchUsers();
  // }, [commentsByTask, id, getUserById]);

  return (
    <Card
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className={`hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing ${
        priority === "high"
          ? "border-red-500"
          : priority === "medium"
          ? "border-yellow-500"
          : "border-green-500"
      }`}
    >
      <CardHeader className="pb-3 ">
        <div className="flex items-start justify-between">
          <Badge variant="secondary" className="text-xs">
            {priority}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Delete</DropdownMenuItem>
              <DropdownMenuItem>Assign Task</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle className="text-base font-semibold mt-2">{title}</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-1 hover:cursor-pointer"
              onClick={() => setTaskCommentClicked(!taskCommentClicked)}
            >
              <MessageSquare className="h-3 w-3 " />
              <span className="text-xs">{commentsByTask[id]?.length || 0}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Paperclip className="h-3 w-3" />
            <span className="text-xs">0 files</span>
          </div>
        </div>
      </CardContent>
      {/* Loading comments */}
      {taskCommentClicked && (
        <CardFooter className="px-4">
          {/* Comments List */}
          <div className="space-y-2 w-full  max-h-40 overflow-y-auto">
            {commentsByTask[id]?.map((comment) => {
              return (
                <div
                  key={comment.id}
                  className="flex items-center gap-2 border w-full p-2 rounded-md"
                >
                  <Avatar className="w-6 h-6 rounded-full bg-blue-700">
                    <AvatarFallback>{}</AvatarFallback>
                  </Avatar>
                  <div className="p-2 rounded-md">
                    <p className="text-sm">{comment.content}</p>
                    {/* <span>Posted At: {String(comment.createdAt.getTime())}</span> */}
                  </div>
                </div>
              );
            })}
            {/* add comment */}
            <div className="w-full flex items-center gap-2 mt-2">
              <Textarea
                placeholder="Add a comment"
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
              />
              <Button
                variant={"secondary"}
                onClick={() => handleAddComment(id)}
              >
                Add
              </Button>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default TaskCard;
