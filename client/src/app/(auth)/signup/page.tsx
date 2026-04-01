"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layers, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function SignUp() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { signup } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signup(formData);
      toast.success("Account created successfully! Please log in.");
      router.push('/login');
    } catch(err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error(String(err));
      }
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950 py-12">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 dark:bg-blue-600/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-green-400/20 dark:bg-green-600/20 blur-[100px] pointer-events-none" />

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
            Create an account
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-slate-500 dark:text-slate-400 mt-2"
          >
            Start your 14-day free trial today
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-slate-800/60 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 rounded-3xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-slate-700 dark:text-slate-300 font-medium">First Name</Label>
                <Input 
                  id="firstName" 
                  type='text' 
                  placeholder="John" 
                  value={formData.firstName} 
                  onChange={handleChange} 
                  required 
                  className="h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-primary focus:border-primary transition-all duration-300 rounded-xl px-4" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-slate-700 dark:text-slate-300 font-medium">Last Name</Label>
                <Input 
                  id="lastName" 
                  type='text' 
                  placeholder="Doe" 
                  value={formData.lastName} 
                  onChange={handleChange} 
                  required 
                  className="h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-primary focus:border-primary transition-all duration-300 rounded-xl px-4" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-primary focus:border-primary transition-all duration-300 rounded-xl px-4"
              />
            </div>

            <div className="space-y-2 relative">
              <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-primary focus:border-primary transition-all duration-300 rounded-xl px-4 pr-10"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-slate-500 pl-1">Must be at least 8 characters long</p>
            </div>

            <div className="space-y-2 relative">
              <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-300 font-medium">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="h-11 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-primary focus:border-primary transition-all duration-300 rounded-xl px-4 pr-10"
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold text-white bg-primary hover:bg-blue-700 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 rounded-xl mt-4 cursor-pointer relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign up for free"}
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:text-blue-700 font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
        
        <p className="text-center text-xs text-slate-400 mt-8">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-slate-500 transition-colors">Terms</Link>
          {" "}and{" "}
          <Link href="/privacy" className="underline hover:text-slate-500 transition-colors">Privacy Policy</Link>
        </p>
      </motion.div>
    </div>
  );
}