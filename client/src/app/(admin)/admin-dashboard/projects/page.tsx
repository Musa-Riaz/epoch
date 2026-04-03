"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { FolderKanban, Calendar, Users, Search, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AdminProject {
  _id: string;
  name: string;
  status: string;
  description?: string;
  deadline?: string;
  team?: string[];
  owner?: { firstName: string; lastName: string; profilePicture?: string };
}

export default function AdminProjects() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await adminApi.getAllSystemProjects();
        const fetchedProjects = res.data.data as unknown as AdminProject[];
        setProjects(fetchedProjects);
        setFilteredProjects(fetchedProjects);
      } catch {
        console.error("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    setFilteredProjects(
      projects.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.owner?.firstName?.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, projects]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "completed": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  if (loading) return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Platform Projects</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-40 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            Platform Projects
          </h1>
          <p className="text-slate-500 mt-1 text-sm">System oversight of all registered projects.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search projects or owners..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredProjects.map((project, idx) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300 border-white/40 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FolderKanban className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate max-w-[150px]">
                          {project.name}
                        </h3>
                        <Badge className={`${getStatusColor(project.status)} text-[10px] uppercase font-bold tracking-wide mt-1`}>
                          {project.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {project.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 h-10">
                      {project.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mb-4">
                    <Avatar className="w-6 h-6 border bg-slate-100">
                      <AvatarImage src={project.owner?.profilePicture} />
                      <AvatarFallback className="text-[10px]">{project.owner?.firstName?.[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400">Owner:</span> {project.owner?.firstName} {project.owner?.lastName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-medium text-slate-500 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {project.deadline ? format(new Date(project.deadline), 'MMM dd, yyyy') : 'No deadline'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {project.team?.length || 0} members
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          
          {filteredProjects.length === 0 && !loading && (
             <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
                <AlertCircle className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-slate-500">No projects found matching your search.</p>
             </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
