"use client";

import { Bell, Search, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/auth.store";
import { useNotificationStore } from "@/stores/notification.store";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { INotification } from "@/interfaces/api";

export function DashboardHeader() {
  const { theme, setTheme } = useTheme();
  const { logout } = useAuthStore()
  const user = useAuthStore((state) => state.user);
  const {
    notifications,
    unreadCount,
    getNotifications,
    markAsRead,
    markAllAsRead,
    pushNotification,
  } = useNotificationStore();
  const router = useRouter(); 


  const handleLogout =  () => {
     logout();
     toast.success("Logged out successfully");
    router.push('/login');

  }

  useEffect(() => {
    if (user?._id) {
      void getNotifications({ page: 1, limit: 10 });
    }
  }, [user?._id, getNotifications]);

  useEffect(() => {
    if (!user?._id) return;

    const socket = getSocket();
    socket.emit('subscribe:user', user._id);

    const onNotification = (payload: INotification) => {
      pushNotification(payload);
    };

    socket.on('notification:new', onNotification);
    return () => {
      socket.off('notification:new', onNotification);
    };
  }, [user?._id, pushNotification]);

  const formatNotificationTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const diffMinutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
    if (diffMinutes < 1) return 'now';
    if (diffMinutes < 60) return `${diffMinutes}m`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
  };

  const notificationsHref = user?.role === "manager"
    ? "/manager-dashboard/notifications"
    : "/member-dashboard";

  return (
    <header
      className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75"
      role="banner"
    >
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
 

        

        {/* Search */}
        <div className="flex max-w-md flex-1 flex-row items-center gap-2">
          <SidebarTrigger className="hover:cursor-pointer" aria-label="Toggle sidebar" />
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for anything..."
              className="pl-10 bg-muted/50"
              aria-label="Search workspace"
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hover:cursor-pointer"
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" aria-label="Open notifications">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full p-0 px-1 flex items-center justify-center text-xs"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    className="h-6 px-2 text-xs"
                    onClick={() => {
                      void markAllAsRead();
                    }}
                  >
                    Mark all read
                  </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-3 py-5 text-sm text-muted-foreground">No notifications yet.</div>
                ) : (
                  notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification._id}
                      className="flex flex-col items-start gap-1 py-3"
                      onClick={() => {
                        if (!notification.isRead) {
                          void markAsRead(notification._id);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className={`w-2 h-2 rounded-full ${notification.isRead ? 'bg-gray-300' : 'bg-blue-500'}`} />
                        <span className="font-medium text-sm">{notification.title}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {formatNotificationTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground pl-4">{notification.message}</p>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-center justify-center text-primary"
                onClick={() => {
                  router.push(notificationsHref);
                }}
              >
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profilePicture} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    {user?.firstName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium">{user?.firstName}</span>
                  <span className="text-xs text-muted-foreground">{user?.email}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
              onClick={()=>router.push("/profile")}
              >Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Team</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
