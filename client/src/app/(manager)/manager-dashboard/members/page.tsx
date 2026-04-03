"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/auth.store";
import { projectApi } from "@/lib/api";
import toast from "react-hot-toast";
import {
  Users,
  UserPlus,
  Search,
  ChevronRight,
  FolderKanban,
  CheckCircle2,
  Loader2,
  Mail,
  X,
  Trash2,
  BarChart2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { api } from "@/lib/axios";

interface MemberProject {
  _id: string;
  name: string;
  status: string;
}

interface Member {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  role: string;
  projects: MemberProject[];
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
}

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  archived: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

function CompletionRing({ rate }: { rate: number }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const dash = (rate / 100) * circ;
  const color = rate >= 75 ? "#22c55e" : rate >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <svg width="48" height="48" className="rotate-[-90deg]">
      <circle cx="24" cy="24" r={r} fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-200 dark:text-slate-700" />
      <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ transition: "stroke-dasharray 0.6s ease" }} />
      <text x="24" y="28" textAnchor="middle" className="rotate-90" fill={color} fontSize="10" fontWeight="bold" style={{ transform: "rotate(90deg)", transformOrigin: "24px 24px" }}>
        {rate}%
      </text>
    </svg>
  );
}

export default function MembersPage() {
  const user = useAuthStore((s) => s.user);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [removeTarget, setRemoveTarget] = useState<{ member: Member; project: MemberProject } | null>(null);
  const [removing, setRemoving] = useState(false);

  // Invite tab state
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [projectList, setProjectList] = useState<{ _id: string; name: string }[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => {
    if (!user?._id) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [membersRes, projectsRes] = await Promise.all([
          projectApi.getManagerMembers(user._id),
          projectApi.getProjectsByManager(user._id),
        ]);
        setMembers(membersRes.data.data as unknown as Member[] ?? []);
        const projs = (projectsRes.data.data as unknown as Record<string, unknown>)?.projects as Array<{_id: string; name: string}> ?? [];
        setProjectList(projs.map((p) => ({ _id: p._id, name: p.name })));
        if (projs.length > 0) setSelectedProjectId(projs[0]._id);
      } catch {
        toast.error("Failed to load team data");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user?._id]);

  const filteredMembers = useMemo(() =>
    members.filter((m) =>
      `${m.firstName} ${m.lastName} ${m.email}`.toLowerCase().includes(search.toLowerCase())
    ), [members, search]);

  const handleAddEmail = () => {
    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Enter a valid email address"); return;
    }
    if (inviteEmails.includes(trimmed)) { toast.error("Already added"); return; }
    setInviteEmails((prev) => [...prev, trimmed]);
    setEmailInput("");
  };

  const handleSendInvites = async () => {
    if (!selectedProjectId || inviteEmails.length === 0) {
      toast.error("Select a project and add at least one email"); return;
    }
    setSendingInvite(true);
    try {
      await api.post("/invitations/send", { projectId: selectedProjectId, emails: inviteEmails });
      toast.success(`${inviteEmails.length} invitation(s) sent!`);
      setInviteEmails([]);
    } catch {
      // handled by interceptor
    } finally {
      setSendingInvite(false);
    }
  };

  const handleRemove = async () => {
    if (!removeTarget || !user?._id) return;
    setRemoving(true);
    try {
      await projectApi.removeMemberFromProject(removeTarget.project._id, removeTarget.member._id);
      toast.success(`${removeTarget.member.firstName} removed from "${removeTarget.project.name}"`);
      // Optimistically update local state
      setMembers((prev) => prev.map((m) =>
        m._id === removeTarget.member._id
          ? { ...m, projects: m.projects.filter((p) => p._id !== removeTarget.project._id) }
          : m
      ).filter((m) => m.projects.length > 0));
      setSelectedMember(null);
      setRemoveTarget(null);
    } catch {
      // handled by interceptor
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            Team Members
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Manage your team across all projects and invite new collaborators.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary rounded-xl px-4 py-2 flex items-center gap-2 text-sm font-semibold">
            <Users className="w-4 h-4" />
            {members.length} {members.length === 1 ? "Member" : "Members"}
          </div>
        </div>
      </div>

      <Tabs defaultValue="team">
        <TabsList className="bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl h-auto">
          <TabsTrigger value="team" className="rounded-lg flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
            <ShieldCheck className="w-4 h-4" /> My Team
          </TabsTrigger>
          <TabsTrigger value="invite" className="rounded-lg flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
            <UserPlus className="w-4 h-4" /> Invite Members
          </TabsTrigger>
        </TabsList>

        {/* ─── MY TEAM TAB ─── */}
        <TabsContent value="team" className="mt-6 space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members..." className="pl-9 bg-white dark:bg-slate-900/50" />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pt-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-36 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs">
                {search ? "No members match your search." : "No team members yet. Invite someone to get started!"}
              </p>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pt-2">
              <AnimatePresence>
                {filteredMembers.map((member, idx) => (
                  <motion.div key={member._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <button onClick={() => setSelectedMember(member)} className="w-full text-left group">
                      <Card className="border border-white/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <Avatar className="h-11 w-11 shrink-0 ring-2 ring-white dark:ring-slate-700 shadow">
                                <AvatarImage src={member.profilePicture} />
                                <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-blue-600 text-white font-bold text-sm">
                                  {member.firstName[0]}{member.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                                  {member.firstName} {member.lastName}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{member.email}</p>
                              </div>
                            </div>
                            <CompletionRing rate={member.completionRate} />
                          </div>

                          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <FolderKanban className="w-3.5 h-3.5" />
                              {member.projects.length} project{member.projects.length !== 1 ? "s" : ""}
                            </span>
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {member.completedTasks}/{member.totalTasks} tasks
                            </span>
                            <span className="text-primary font-medium flex items-center gap-0.5 group-hover:gap-1 transition-all">
                              View <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </TabsContent>

        {/* ─── INVITE MEMBERS TAB ─── */}
        <TabsContent value="invite" className="mt-6">
          <div className="max-w-2xl space-y-6">
            <Card className="bg-white/70 dark:bg-slate-900/50 border-white/60 dark:border-slate-700/60 backdrop-blur-md shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" /> Send Project Invitations
                </CardTitle>
                <CardDescription>Invite people by email to join one of your projects.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Project selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Select Project</label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {projectList.map((p) => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Email input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Add Email Addresses</label>
                  <div className="flex gap-2">
                    <Input value={emailInput} onChange={(e) => setEmailInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddEmail()}
                      placeholder="colleague@company.com"
                      className="bg-white dark:bg-slate-900" />
                    <Button onClick={handleAddEmail} variant="outline" className="shrink-0">Add</Button>
                  </div>
                </div>

                {/* Email chips */}
                {inviteEmails.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {inviteEmails.map((email) => (
                      <span key={email} className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                        {email}
                        <button onClick={() => setInviteEmails((prev) => prev.filter((e) => e !== email))}>
                          <X className="w-3.5 h-3.5 hover:text-red-500" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <Button onClick={handleSendInvites} disabled={sendingInvite || inviteEmails.length === 0}
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium">
                  {sendingInvite ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                  Send {inviteEmails.length > 0 ? `${inviteEmails.length}` : ""} Invitation{inviteEmails.length !== 1 ? "s" : ""}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── Member Detail Dialog ─── */}
      <Dialog open={!!selectedMember} onOpenChange={(o) => !o && setSelectedMember(null)}>
        <DialogContent className="max-w-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-white/40 dark:border-slate-700/50 shadow-2xl rounded-2xl">
          {selectedMember && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4 mb-2">
                  <Avatar className="h-14 w-14 ring-2 ring-primary/20">
                    <AvatarImage src={selectedMember.profilePicture} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-blue-600 text-white text-lg font-bold">
                      {selectedMember.firstName[0]}{selectedMember.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-xl font-bold">
                      {selectedMember.firstName} {selectedMember.lastName}
                    </DialogTitle>
                    <DialogDescription className="text-sm">{selectedMember.email}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 mt-2">
                {[
                  { label: "Projects", value: selectedMember.projects.length, icon: FolderKanban, color: "text-blue-500" },
                  { label: "Total Tasks", value: selectedMember.totalTasks, icon: BarChart2, color: "text-purple-500" },
                  { label: "Completed", value: selectedMember.completedTasks, icon: CheckCircle2, color: "text-emerald-500" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 text-center">
                    <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
                    <p className="text-xl font-bold text-slate-800 dark:text-white">{value}</p>
                    <p className="text-xs text-slate-500">{label}</p>
                  </div>
                ))}
              </div>

              {/* Completion rate */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 flex items-center gap-4">
                <CompletionRing rate={selectedMember.completionRate} />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white">Task Completion Rate</p>
                  <p className="text-sm text-slate-500">
                    {selectedMember.completedTasks} of {selectedMember.totalTasks} tasks completed
                  </p>
                </div>
              </div>

              {/* Projects list with remove action */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Assigned Projects</p>
                {selectedMember.projects.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">No projects assigned.</p>
                ) : (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {selectedMember.projects.map((proj) => (
                      <div key={proj._id} className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <FolderKanban className="w-4 h-4 shrink-0 text-slate-400" />
                          <span className="text-sm font-medium text-slate-800 dark:text-white truncate">{proj.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge className={`text-xs ${statusColors[proj.status] ?? statusColors.archived}`}>
                            {proj.status}
                          </Badge>
                          <button
                            onClick={() => setRemoveTarget({ member: selectedMember, project: proj })}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Remove from project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Confirm Remove Dialog ─── */}
      <Dialog open={!!removeTarget} onOpenChange={(o) => !o && setRemoveTarget(null)}>
        <DialogContent className="max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-red-200/40 dark:border-red-800/30 rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-content-center">
                <AlertCircle className="w-5 h-5 text-red-500 mx-auto mt-2.5" />
              </div>
              <div>
                <DialogTitle>Remove Member</DialogTitle>
                <DialogDescription>This action cannot be undone.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {removeTarget && (
            <p className="text-sm text-slate-600 dark:text-slate-400 py-2">
              Are you sure you want to remove <strong>{removeTarget.member.firstName} {removeTarget.member.lastName}</strong> from <strong>&ldquo;{removeTarget.project.name}&rdquo;</strong>? They will lose access to this project and all its tasks.
            </p>
          )}
          <DialogFooter className="gap-2 flex-row justify-end">
            <Button variant="outline" onClick={() => setRemoveTarget(null)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleRemove} disabled={removing}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl">
              {removing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
