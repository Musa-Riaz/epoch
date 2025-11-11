# Dashboard Sidebar Implementation

## Overview
The member dashboard now uses shadcn's official Sidebar component with full support for collapsible/expandable states, mobile responsiveness, and tooltip integration.

## Features

### ✨ Sidebar Features
- **Collapsible**: Click the sidebar trigger to collapse/expand (keyboard shortcut: `Ctrl/Cmd + B`)
- **Icon Mode**: When collapsed, shows only icons with tooltips on hover
- **Mobile Responsive**: Automatically converts to a sheet/drawer on mobile devices
- **Persistent State**: Sidebar state is saved in cookies across sessions

### 🎨 Components Structure

#### `DashboardLayout`
Main layout wrapper that provides:
- `SidebarProvider` - Context for sidebar state management
- `TooltipProvider` - Enables tooltips for collapsed sidebar
- `SidebarInset` - Main content area that adjusts based on sidebar state

#### `DashboardSidebar`
Implements shadcn Sidebar with:
- **Header**: Logo and app branding
- **Content**: Navigation links with active state indicators
- **Footer**: User profile dropdown with quick actions

#### `DashboardHeader`
Top navigation bar featuring:
- `SidebarTrigger` - Button to toggle sidebar
- Search bar
- Theme toggle (light/dark mode)
- Notifications dropdown
- User profile menu

## Usage

```tsx
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function Page() {
  return (
    <DashboardLayout>
      {/* Your page content */}
    </DashboardLayout>
  );
}
```

## Navigation Links

Current routes:
- `/member-dashboard` - Main dashboard with Kanban board
- `/member-dashboard/projects` - Projects overview
- `/member-dashboard/tasks` - My tasks list
- `/member-dashboard/team` - Team members
- `/member-dashboard/messages` - Team chat/messages
- `/member-dashboard/settings` - User settings

## Customization

### Adding New Menu Items

Edit `src/components/layout/dashboard-sidebar.tsx`:

```tsx
const sidebarLinks = [
  // ... existing links
  {
    title: "New Page",
    href: "/member-dashboard/new-page",
    icon: YourIcon,
  },
];
```

### Changing Sidebar Behavior

Modify the `collapsible` prop in `DashboardSidebar`:
- `"icon"` - Collapses to icon-only mode (default)
- `"offcanvas"` - Slides completely off-screen
- `"none"` - Cannot be collapsed

```tsx
<Sidebar collapsible="offcanvas">
```

### Theme Customization

The sidebar uses CSS variables defined in `globals.css`:
- `--sidebar-background`
- `--sidebar-foreground`
- `--sidebar-border`
- `--sidebar-accent`
- etc.

## Technical Details

### State Management
- Sidebar state is managed by `SidebarProvider` context
- State persists via cookies (`sidebar_state`)
- Mobile state is separate from desktop state

### Keyboard Shortcuts
- `Ctrl/Cmd + B` - Toggle sidebar

### Responsive Breakpoints
- Mobile: Sheet/drawer navigation (< 1024px)
- Desktop: Collapsible sidebar (≥ 1024px)

## Dependencies
- `@radix-ui/react-*` - Headless UI primitives
- `next-themes` - Theme switching
- `lucide-react` - Icons
- `class-variance-authority` - Component variants
