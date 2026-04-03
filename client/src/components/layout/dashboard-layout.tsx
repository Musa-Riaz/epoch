"use client";

import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardHeader } from "./dashboard-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  return (
    <TooltipProvider>
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset className="bg-slate-50/50 dark:bg-slate-950/50 relative overflow-hidden">
          {/* Ambient Background Hues */}
          <div className="fixed top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-indigo-400/20 dark:bg-indigo-600/20 blur-[120px] pointer-events-none z-0" />
          <div className="fixed bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-blue-400/20 dark:bg-blue-600/20 blur-[120px] pointer-events-none z-0" />
          <div className="fixed top-[40%] left-[20%] w-[300px] h-[300px] rounded-full bg-purple-400/10 dark:bg-purple-600/10 blur-[100px] pointer-events-none z-0" />

          <div className="relative z-10 flex flex-col h-full w-full">
            <DashboardHeader />

            <main
              id="app-main"
              tabIndex={-1}
              className="flex-1 overflow-y-auto w-full relative"
              aria-label="Dashboard content"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8"
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
