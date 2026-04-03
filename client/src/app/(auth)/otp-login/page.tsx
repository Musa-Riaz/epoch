"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Mail, Terminal, ScanFace } from "lucide-react";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/stores/auth.store";
import toast from "react-hot-toast";

export default function OtpLoginPage() {
  const router = useRouter();
  const { setCredentials } = useAuthStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");

    setLoading(true);
    try {
      const res = await api.post("/auth/otp/send", { email });
      if (res.data.success) {
        toast.success("Login code sent to your email!");
        setStep(2);
      }
    } catch (err: any) {
      // Handled by axios interceptor toast
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return toast.error("Please enter the code");

    setLoading(true);
    try {
      const res = await api.post("/auth/otp/login", { email, otp });
      if (res.data.success) {
        setCredentials(res.data.data.user, res.data.data.accessToken);
        toast.success("Welcome back!");
        
        switch (res.data.data.user.role) {
          case 'admin':
            router.push('/admin-dashboard/analytics');
            break;
          case 'manager':
            router.push('/manager-dashboard');
            break;
          default:
            router.push('/member-dashboard');
        }
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
        Back to passwords
      </Link>

      <div className="w-full max-w-[400px]">
        <div className="text-center mb-10">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }} className="w-16 h-16 bg-white/50 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-lg rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ScanFace className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </motion.div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Magic Code Login</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
            {step === 1 ? "Enter your email and we'll send you a passwordless single-use code to log in." : 
             "We've sent a 6-digit secure code. Please enter it below to verify your identity."}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form key="step1" onSubmit={handleSendOtp} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Registered Email</Label>
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
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Magic Code"}
              </Button>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form key="step2" onSubmit={handleVerifyOtp} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp">Authentication Code</Label>
                <Input 
                  type="text" 
                  id="otp" 
                  value={otp} 
                  maxLength={6}
                  onChange={(e) => setOtp(e.target.value)} 
                  placeholder="000000" 
                  className="h-14 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-white/40 dark:border-white/10 text-center text-xl tracking-[0.5em] rounded-xl font-bold font-mono"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-base shadow-xl shadow-indigo-600/20">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Identity"}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
