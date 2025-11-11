import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { MessageSquare, MoreVertical, Paperclip } from 'lucide-react'
import { Avatar, AvatarFallback } from '@radix-ui/react-avatar'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities' 

interface TaskCardProps {
    id: string;
    priority: string;
    title: string;
    description: string;
}

const TaskCard = ({id, priority, title, description}: TaskCardProps) => {

    const {attributes, listeners, setNodeRef, transition, transform, isDragging} = useSortable({id})

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
         opacity: isDragging ? 0.5 : 1,
         boxShadow: isDragging ? (priority === 'low' ? '0 4px 8px rgba(90, 219, 78, 0.837)' : priority === 'medium' ? '0 4px 8px rgba(255, 193, 7, 0.837)' : '0 4px 8px rgba(220, 38, 38, 0.837)') : 'none',
    }

  return (
       <Card 
         ref={setNodeRef} 
         {...attributes} 
         {...listeners} 
         style={style}   
         className={`hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing ${priority === 'high' ? 'border-red-500' : priority === 'medium' ? 'border-yellow-500' : 'border-green-500'}`}
       >
                <CardHeader className="pb-3 ">
                  <div className="flex items-start justify-between">
                    <Badge variant="secondary" className="text-xs">{priority}</Badge>
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
                  <CardTitle className="text-base font-semibold mt-2">
                    {title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {description}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-1">
                        {[1, 2, 3].map((i) => (
                          <Avatar key={i} className="border-2 border-background w-6 h-6">
                            <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-600 text-white text-xs">
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
                      <span className="text-xs">0 files</span>
                    </div>
                  </div>
                </CardContent>
              </Card> 
  )
}

export default TaskCard