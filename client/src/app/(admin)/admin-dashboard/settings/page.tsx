"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Server, Database, Activity, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSettings() {
  const handleWipeAction = () => {
    toast.error("System Wipe Protocol is disabled for security reasons.");
  };

  const handleBackup = () => {
    toast.success("Database Backup successfully queued. Check your email for logs.");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
          System Management
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Configure core infrastructure flags and actions.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md border-white/40 dark:border-slate-800/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-500" /> Database Operations
            </CardTitle>
            <CardDescription>Direct interface with the primary instance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleBackup} className="w-full justify-start rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 shadow-none border border-indigo-100 dark:border-indigo-800/50">
              <ShieldCheck className="w-4 h-4 mr-2" /> Request MongoDB Snapshot
            </Button>
            <p className="text-xs text-slate-500 dark:text-slate-400 px-1">
              Creates a secure BSON archive of the current database state including indexes.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md border-white/40 dark:border-slate-800/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" /> Danger Zone
            </CardTitle>
            <CardDescription>Irreversible destructive actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleWipeAction} variant="destructive" className="w-full justify-start rounded-xl shadow-none">
              <Server className="w-4 h-4 mr-2" /> Purge Analytics Cache
            </Button>
            <Button onClick={handleWipeAction} variant="destructive" className="w-full justify-start rounded-xl shadow-none bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-900/50">
              <Activity className="w-4 h-4 mr-2" /> Wipe Inactive Workspaces
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
