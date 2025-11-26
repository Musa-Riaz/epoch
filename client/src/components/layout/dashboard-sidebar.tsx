"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Users, 
  MessageSquare,
  Settings,
  Layers,
  ChevronUp,
  User2,
  BarChart3,
  FileText,
  UserCog
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth.store";
import {  useMemo } from "react";
import { LucideIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";


type SidebarLink = {
  title: string;
  href: string;
  icon: LucideIcon;
};

const sidebarLinksMember: SidebarLink[] = [
  {
    title: "Dashboard",
    href: "/member-dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Projects",
    href: "/member-dashboard/my-projects",
    icon: FolderKanban,
  },
  {
    title: "My Tasks",
    href: "/member-dashboard/tasks",
    icon: CheckSquare,
  },
  {
    title: "Team",
    href: "/member-dashboard/team",
    icon: Users,
  },
  {
    title: "Messages",
    href: "/member-dashboard/messages",
    icon: MessageSquare,
  },
];

const sidebarLinksManager: SidebarLink[] = [
  {
    title: "Dashboard",
    href: "/manager-dashboard",
    icon: LayoutDashboard
  }
  ,
  {
    title: "Analytics",
    href: "/manager-dashboard/analytics",
    icon: BarChart3
  },
  {
    title: "Projects",
    href: "/manager-dashboard/projects",
    icon: FolderKanban
  },
  {
    title: "Tasks",
    href: "/manager-dashboard/tasks",
    icon: CheckSquare
  },
  {
    title: "Members",
    href: "/manager-dashboard/members",
    icon: Users
  },
  {
    title: "Reports",
    href: "/manager-dashboard/reports",
    icon: FileText
  },
];

const sidebarLinksAdmin: SidebarLink[] = [
  {
    title: "Analytics",
    href: "/admin-dashboard/analytics",
    icon: BarChart3
  },
  {
    title: "Projects",
    href: "/admin-dashboard/projects",
    icon: FolderKanban
  },
  {
    title: "Tasks",
    href: "/admin-dashboard/tasks",
    icon: CheckSquare
  },
  {
    title: "Members",
    href: "/admin-dashboard/members",
    icon: UserCog
  },
  {
    title: "Settings",
    href: "/admin-dashboard/settings",
    icon: Settings
  },
];

export function DashboardSidebar() {
  const userRole = useAuthStore((state) => state.user?.role);
  const {user, logout} = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  // Use useMemo to calculate links based on role
  const links = useMemo(() => {
    switch (userRole) {
      case 'member':
        return sidebarLinksMember;
      case 'manager':
        return sidebarLinksManager;
      case 'admin':
        return sidebarLinksAdmin;
      default:
        return sidebarLinksMember; // Default to member links
    }
  }, [userRole]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/member-dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Layers className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Epoch</span>
                  <span className="text-xs text-muted-foreground">Project Manager</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                
                return (
                  <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={link.title}
                    >
                      <Link href={link.href}>
                        <Icon />
                        <span>{link.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild
                  isActive={pathname === "/member-dashboard/settings"}
                  tooltip="Settings"
                >
                  <Link href="/member-dashboard/settings">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold text-sm">{user?.firstName} {user?.lastName}</span>
                    <span className="text-xs text-muted-foreground">
                      {userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'Member'}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                side="top" 
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User2 className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/member-dashboard/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

