"use client";

import { useEffect, useState } from "react";
import { authApi, adminApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Search, Trash2, Mail, ShieldAlert, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/auth.store";

export default function AdminMembers() {
  const currentAdmin = useAuthStore(state => state.user);
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await authApi.getAllUsers();
      setUsers(res.data.data.users);
      setFilteredUsers(res.data.data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFilteredUsers(
      users.filter(u =>
        u.firstName.toLowerCase().includes(search.toLowerCase()) ||
        u.lastName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, users]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteUser(deleteTarget._id);
      toast.success(`${deleteTarget.firstName} has been permanently deleted.`);
      setUsers(prev => prev.filter(u => u._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      // toast is handled by interceptor ideally
    } finally {
      setDeleting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch(role) {
      case "admin": return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0">Super Admin</Badge>;
      case "manager": return <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0">Manager</Badge>;
      default: return <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-0">Member</Badge>;
    }
  };

  if(loading) return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Platform Users</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-28 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            Platform Users
          </h1>
          <p className="text-slate-500 mt-1 text-sm">System oversight of all registered users and their roles.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredUsers.map((u, idx) => (
            <motion.div
              key={u._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.03 }}
            >
              <Card className="hover:shadow-md transition-all duration-300 border-white/40 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md">
                <CardContent className="p-4 flex items-center justify-between group">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="w-12 h-12 ring-2 ring-white dark:ring-slate-800 shadow-sm shrink-0">
                      <AvatarImage src={u.profilePicture} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
                        {u.firstName[0]}{u.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                          {u.firstName} {u.lastName}
                        </h3>
                        {currentAdmin?._id === u._id && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 rounded-sm font-bold">YOU</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate mb-1.5">
                        <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate">{u.email}</span>
                      </div>
                      {getRoleBadge(u.role)}
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-2 text-xs">
                     <span className="text-slate-400" title="Joined Date">
                       {format(new Date(u.createdAt), 'MMM yyyy')}
                     </span>
                     {u.role !== 'admin' && (
                       <button 
                         onClick={() => setDeleteTarget(u)}
                         className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                         title="Ban / Delete User"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                     )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          
          {filteredUsers.length === 0 && !loading && (
             <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
                <Users className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-slate-500">No users found matching your search.</p>
             </div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-red-200/40 dark:border-red-800/30 rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <DialogTitle className="text-red-600 dark:text-red-400">Permanently Delete User?</DialogTitle>
                <DialogDescription>This is a destructive system-wide action.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {deleteTarget && (
            <div className="py-3 text-sm text-slate-600 dark:text-slate-400">
              <p className="mb-2">
                Are you absolutely sure you want to permanently delete <strong>{deleteTarget.firstName} {deleteTarget.lastName}</strong>?
              </p>
              <ul className="list-disc pl-5 space-y-1 text-red-500/80">
                <li>Their account will be destroyed.</li>
                <li>All projects they <strong>own</strong> will be wiped.</li>
                <li>Any pending invitations tied to them will be cancelled.</li>
              </ul>
            </div>
          )}
          <DialogFooter className="gap-2 flex-row justify-end">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleDelete} disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl">
              {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
