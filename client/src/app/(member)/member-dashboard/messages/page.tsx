"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  Send,
  Plus,
  MoreVertical,
  Image as ImageIcon,
  Paperclip,
  Smile
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data - replace with actual API calls
const mockConversations = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "manager",
    avatar: "",
    lastMessage: "Can you review the latest pull request?",
    timestamp: "2 min ago",
    unread: 2,
    online: true
  },
  {
    id: 2,
    name: "Team - E-Commerce Platform",
    role: "group",
    avatar: "",
    lastMessage: "Mike: The API integration is complete",
    timestamp: "15 min ago",
    unread: 5,
    online: false
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "member",
    avatar: "",
    lastMessage: "Thanks for the help!",
    timestamp: "1 hour ago",
    unread: 0,
    online: true
  },
  {
    id: 4,
    name: "David Kim",
    role: "manager",
    avatar: "",
    lastMessage: "Let's schedule a meeting tomorrow",
    timestamp: "2 hours ago",
    unread: 0,
    online: false
  },
  {
    id: 5,
    name: "Team - Mobile App Redesign",
    role: "group",
    avatar: "",
    lastMessage: "Jessica: New mockups are ready",
    timestamp: "3 hours ago",
    unread: 1,
    online: false
  }
];

const mockMessages = [
  {
    id: 1,
    senderId: 1,
    senderName: "Sarah Johnson",
    message: "Hi! Can you review the latest pull request when you get a chance?",
    timestamp: "10:30 AM",
    isOwn: false
  },
  {
    id: 2,
    senderId: "me",
    senderName: "You",
    message: "Sure! I'll take a look at it right now.",
    timestamp: "10:32 AM",
    isOwn: true
  },
  {
    id: 3,
    senderId: 1,
    senderName: "Sarah Johnson",
    message: "Great! It's mainly the authentication module. Let me know if you have any questions.",
    timestamp: "10:33 AM",
    isOwn: false
  },
  {
    id: 4,
    senderId: "me",
    senderName: "You",
    message: "I've reviewed it. The implementation looks good, but I have a few suggestions for optimization.",
    timestamp: "10:45 AM",
    isOwn: true
  },
  {
    id: 5,
    senderId: 1,
    senderName: "Sarah Johnson",
    message: "Can you review the latest pull request?",
    timestamp: "Just now",
    isOwn: false
  }
];

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
  const [messageInput, setMessageInput] = useState("");

  const filteredConversations = mockConversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // TODO: Send message via API
      console.log("Sending message:", messageInput);
      setMessageInput("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground mt-1">
            Communicate with your team members
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Message
        </Button>
      </div>

      {/* Messages Container */}
      <Card className="h-[calc(100vh-250px)]">
        <div className="grid grid-cols-12 h-full">
          {/* Conversations List */}
          <div className="col-span-4 border-r">
            <CardHeader className="border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <ScrollArea className="h-[calc(100%-80px)]">
              <div className="space-y-1 p-2">
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={cn(
                      "w-full p-3 rounded-lg text-left hover:bg-accent transition-colors",
                      selectedConversation.id === conv.id && "bg-accent"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={conv.avatar} alt={conv.name} />
                          <AvatarFallback>
                            {conv.role === "group" ? "👥" : conv.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        {conv.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-semibold truncate">{conv.name}</span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {conv.timestamp}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.lastMessage}
                          </p>
                          {conv.unread > 0 && (
                            <Badge className="bg-primary text-primary-foreground rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                              {conv.unread}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="col-span-8 flex flex-col">
            {/* Chat Header */}
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.name} />
                      <AvatarFallback>
                        {selectedConversation.role === "group" 
                          ? "👥" 
                          : selectedConversation.name.split(" ").map(n => n[0]).join("")
                        }
                      </AvatarFallback>
                    </Avatar>
                    {selectedConversation.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{selectedConversation.name}</CardTitle>
                    <CardDescription>
                      {selectedConversation.online ? "Online" : "Offline"}
                    </CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {mockMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-3",
                      msg.isOwn && "flex-row-reverse"
                    )}
                  >
                    {!msg.isOwn && (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="" alt={msg.senderName} />
                        <AvatarFallback className="text-xs">
                          {msg.senderName.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={cn("max-w-[70%] space-y-1", msg.isOwn && "items-end")}>
                      <div
                        className={cn(
                          "rounded-lg px-4 py-2",
                          msg.isOwn
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <p className="text-sm">{msg.message}</p>
                      </div>
                      <span className="text-xs text-muted-foreground px-2">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <CardContent className="border-t p-4">
              <div className="flex items-end gap-2">
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <ImageIcon className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Smile className="w-5 h-5" />
                  </Button>
                </div>
                <Textarea
                  placeholder="Type your message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="min-h-[60px] resize-none"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  size="icon"
                  className="h-[60px] w-[60px]"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </div>
        </div>
      </Card>
    </div>
  );
}
