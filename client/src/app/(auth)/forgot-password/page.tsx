"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Mail, KeyRound, Lock, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/axios";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");

    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      if (res.data.success) {
        toast.success("Verification code sent to your email!");
        setStep(2);
      }
    } catch (err: any) {
      // Handled by axios interceptor toast
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword) return toast.error("Please fill in all fields");
    if (newPassword.length < 8) return toast.error("Password must be at least 8 characters");

    setLoading(true);
    try {
      const res = await api.post("/auth/reset-password", { email, otp, newPassword });
      if (res.data.success) {
        toast.success("Password reset successfully!");
        setStep(3);
      }
    } catch (err: any) {
      // Handled by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full relative z-10 p-6 sm:p-10 flex flex-col items-center">
      <Link href="/login" className="self-start text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center transition-colors mb-6 group">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to log in
      </Link>

      <div className="w-full max-w-[400px]">
        <div className="text-center mb-10">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }} className="w-16 h-16 bg-white/50 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-lg rounded-2xl flex items-center justify-center mx-auto mb-6">
            <KeyRound className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </motion.div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Forgot Password?</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
            {step === 1 ? "No worries, we'll send you reset instructions. Enter your registered email." : 
             step === 2 ? "We've sent a 6-digit verification code. Please check your inbox." : "Your password has been successfully reset. You can now log in securely."}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form key="step1" onSubmit={handleSendOtp} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input 
                    type="email" 
                    id="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="name@company.com" 
                    className="pl-10 h-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-white/40 dark:border-white/10 focus:ring-indigo-500 rounded-xl"
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-base shadow-xl shadow-indigo-600/20">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Code"}
              </Button>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form key="step2" onSubmit={handleResetPassword} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp">6-Digit Code</Label>
                <Input 
                  type="text" 
                  id="otp" 
                  value={otp} 
                  maxLength={6}
                  onChange={(e) => setOtp(e.target.value)} 
                  placeholder="000000" 
                  className="h-14 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-white/40 dark:border-white/10 text-center text-xl tracking-[0.5em] rounded-xl font-bold"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input 
                    type="password" 
                    id="newPassword" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    placeholder="••••••••" 
                    className="pl-10 h-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-white/40 dark:border-white/10 rounded-xl"
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-base shadow-xl shadow-emerald-600/20">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset Password"}
              </Button>
            </motion.form>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center space-y-6">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <Button onClick={() => router.push("/login")} className="w-full h-12 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white rounded-xl text-base">
                Go to Log In
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
