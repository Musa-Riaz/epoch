"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layers, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const { login } = useAuthStore();

  useEffect(() => {
    const pendingInvitation = localStorage.getItem("pending_invitation");
    if (pendingInvitation) {
      toast("Please log in to accept your project invitation", {
        icon: "📧",
        duration: 4000,
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back to Epoch!");
      
      const pendingInvitation = localStorage.getItem("pending_invitation");
      const redirect = searchParams?.get("redirect");
      
      if (pendingInvitation && redirect) {
        localStorage.removeItem("pending_invitation");
        router.push(`${redirect}?token=${pendingInvitation}`);
        return;
      }
      
      const userRole = useAuthStore.getState().user?.role;
      
      switch (userRole){
        case 'admin':
          router.push('/admin-dashboard');
          break;
        case 'manager':
          router.push('/manager-dashboard');
          break;
        case 'member':
          router.push('/member-dashboard');
          break;
      }
    } catch {
      toast.error("Login failed. Please check your credentials.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 dark:bg-blue-600/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-green-400/20 dark:bg-green-600/20 blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md p-6 md:p-8 relative z-10"
      >
        <div className="mb-10 text-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="w-14 h-14 bg-gradient-to-br from-primary to-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-primary/30 mb-6"
          >
            <Layers className="w-7 h-7 text-white" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            Welcome back
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-slate-500 dark:text-slate-400 mt-2"
          >
            Enter your credentials to access your workspace
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-slate-800/60 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 rounded-3xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-medium">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-primary focus:border-primary transition-all duration-300 rounded-xl px-4"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-medium">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:text-blue-700 dark:hover:text-blue-400 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-primary focus:border-primary transition-all duration-300 rounded-xl px-4 pr-10"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold text-white bg-primary hover:bg-blue-700 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 rounded-xl mt-2 cursor-pointer relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign in to Epoch"}
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary hover:text-blue-700 font-semibold transition-colors">
                Create a free workspace
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}