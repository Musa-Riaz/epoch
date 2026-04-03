"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { CheckSquare, Clock, Search, AlertCircle, FileText, FolderKanban } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AdminTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await adminApi.getAllSystemTasks();
        setTasks(res.data.data);
        setFilteredTasks(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  useEffect(() => {
    setFilteredTasks(
      tasks.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.assignedTo?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
        t.projectId?.name?.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, tasks]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "medium": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "low": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  if (loading) return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Platform Tasks</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-40 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            Platform Tasks
          </h1>
          <p className="text-slate-500 mt-1 text-sm">System oversight of all tasks running across the platform.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search tasks, assignee, or project..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredTasks.map((task, idx) => (
            <motion.div
              key={task._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="hover:shadow-lg shadow-sm border-white/40 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md transition-all">
                <CardContent className="p-5 rounded-l-md" style={{ borderLeftColor: task.status === 'done' ? '#10b981' : task.status === 'in-progress' ? '#3b82f6' : '#e2e8f0' }}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-sm">
                      {task.status}
                    </span>
                    <Badge className={`${getPriorityColor(task.priority)} text-[10px] uppercase border-0 shadow-none`}>
                      {task.priority || 'Normal'}
                    </Badge>
                  </div>

                  <h3 className="font-semibold text-slate-900 dark:text-white capitalize mb-1 line-clamp-1 py-1">
                    {task.title}
                  </h3>
                  
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4 h-4">
                     <FolderKanban className="w-3.5 h-3.5" />
                     <span className="truncate max-w-[180px]">{task.projectId?.name || "Unknown Project"}</span>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {task.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6 border border-white dark:border-slate-800 shadow-sm">
                          <AvatarImage src={task.assignedTo.profilePicture} />
                          <AvatarFallback className="text-[10px] bg-indigo-100 text-indigo-700">{task.assignedTo.firstName[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          {task.assignedTo.firstName} {task.assignedTo.lastName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Unassigned</span>
                    )}

                    {task.dueDate && (
                      <span className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md">
                        <Clock className="w-3 h-3" />
                        {format(new Date(task.dueDate), 'MMM dd')}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          
          {filteredTasks.length === 0 && !loading && (
             <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
                <FileText className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-slate-500">No tasks found matching your search.</p>
             </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
