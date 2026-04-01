"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowUpRight, BarChart3, CheckCircle2, FolderKanban, Layers, Menu, Shield, Users, X, Zap } from "lucide-react";

const customEase = [0.32, 0.72, 0, 1];

const FloatingNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: customEase }}
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 rounded-full px-2 py-2 flex items-center justify-between
          ${isScrolled ? 'w-[90%] max-w-4xl bg-white/70 backdrop-blur-2xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)] border border-white/40' : 'w-full max-w-7xl bg-transparent'}`}
      >
        <div className="flex items-center gap-2 pl-4">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold tracking-tight text-lg">Epoch</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100/50 rounded-full p-1 border border-white/60">
          {["Features", "Solutions", "Testimonials"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="px-5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-full hover:bg-white/80 transition-colors"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2 pr-2">
          <Link href="/login" className="px-5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Login
          </Link>
          <Link href="/signup" className="group flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-all hover:scale-[0.98] active:scale-95 duration-300">
            Get Started
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>

        <button 
          className="md:hidden p-2 text-slate-900 pr-4" 
          onClick={() => setIsOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
      </motion.nav>

      {/* Mobile Menu Expansion */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-3xl flex flex-col pt-24 px-8 pb-8"
          >
            <button 
              className="absolute top-8 right-8 p-3 rounded-full bg-slate-100"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex flex-col gap-6 mt-12">
              {["Features", "Solutions", "Testimonials"].map((item, i) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.6, ease: customEase }}
                  onClick={() => setIsOpen(false)}
                  className="text-4xl font-bold tracking-tight text-slate-900"
                >
                  {item}
                </motion.a>
              ))}
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6, ease: customEase }}
                className="mt-8 flex flex-col gap-4"
              >
                <Link href="/login" onClick={() => setIsOpen(false)} className="w-full py-4 text-center text-lg font-medium border border-slate-200 rounded-2xl">
                  Sign In
                </Link>
                <Link href="/signup" onClick={() => setIsOpen(false)} className="w-full py-4 text-center text-lg font-medium bg-primary text-white rounded-2xl">
                  Start Free Trial
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const HeroSection = () => {
  return (
    <section className="relative min-h-[100dvh] pt-40 pb-24 overflow-hidden bg-slate-50 flex items-center">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-blue-100/60 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-emerald-100/50 blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          <div className="flex-1 text-left w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: customEase }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-primary text-xs font-semibold uppercase tracking-widest mb-8">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Epoch 2.0 is Live
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-tighter leading-[1.05] text-slate-900 mb-8 max-w-[15ch]">
                Operations that scale with you.
              </h1>
              <p className="text-lg md:text-xl text-slate-500 font-medium max-w-[45ch] mb-12 leading-relaxed">
                The ultimate platform for high-velocity teams. Align projects, track tasks, and execute with flawless precision across your entire organization.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link href="/signup" className="group flex items-center justify-center gap-3 bg-primary text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transition-all hover:scale-[0.98] active:scale-95 duration-300 w-full sm:w-auto">
                  Start Building
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </Link>
                <div className="flex -space-x-3 items-center ml-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`w-10 h-10 rounded-full border-2 border-white bg-slate-${i*100+100} flex items-center justify-center shadow-sm overflow-hidden`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <div className="pl-6 text-sm font-medium text-slate-500">
                    Trusted by 10k+ teams
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div 
            className="flex-1 w-full relative hidden lg:block"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: customEase }}
          >
            {/* Doppelrand Feature Banners */}
            <div className="relative w-full aspect-square max-w-[600px] mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-emerald-500/5 rounded-[3rem] border border-white p-4 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)]">
                <div className="w-full h-full bg-white/80 backdrop-blur-xl rounded-[calc(3rem-16px)] shadow-[inset_0_2px_4px_rgba(255,255,255,0.7)] p-8 flex flex-col gap-6 overflow-hidden relative">
                  
                  {/* Mock UI Element 1 */}
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="p-5 bg-slate-50/80 border border-slate-100 rounded-2xl flex items-center gap-4 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center"><FolderKanban className="w-6 h-6"/></div>
                    <div className="flex-1">
                      <div className="h-4 w-24 bg-slate-200 rounded-full mb-2"></div>
                      <div className="h-3 w-40 bg-slate-100 rounded-full"></div>
                    </div>
                    <div className="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded-full shadow-sm">In Progress</div>
                  </motion.div>

                  {/* Mock UI Element 2 */}
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="p-5 bg-white border border-slate-100 rounded-2xl flex items-center gap-4 shadow-lg shadow-black/5 z-10 translate-x-8"
                  >
                    <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center"><CheckCircle2 className="w-6 h-6"/></div>
                    <div className="flex-1">
                      <div className="h-4 w-32 bg-slate-200 rounded-full mb-2"></div>
                      <div className="h-3 w-48 bg-slate-100 rounded-full"></div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><ArrowRight className="w-4 h-4 text-slate-400"/></div>
                  </motion.div>

                   {/* Mock UI Element 3 */}
                   <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.0, duration: 0.8 }}
                    className="p-5 bg-slate-50/80 border border-slate-100 rounded-2xl flex items-center gap-4 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"><BarChart3 className="w-6 h-6"/></div>
                    <div className="flex-1">
                      <div className="h-4 w-20 bg-slate-200 rounded-full mb-2"></div>
                      <div className="h-3 w-32 bg-slate-100 rounded-full"></div>
                    </div>
                  </motion.div>

                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-tr from-primary/20 to-transparent blur-2xl rounded-full"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const BentoFeatures = () => {
  return (
    <section id="features" className="py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-20 text-left">
          <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-widest mb-4">Core Capabilities</div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 max-w-2xl">
            Everything you need. Nothing you don&apos;t.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Spans 2 cols */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: customEase }}
            className="md:col-span-2 bg-slate-50 rounded-[2.5rem] p-2 border border-slate-200/60 shadow-sm"
          >
            <div className="bg-white rounded-[calc(2.5rem-8px)] h-full p-10 flex flex-col md:flex-row gap-8 items-center justify-between overflow-hidden relative shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex-1 z-10">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                  <FolderKanban className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Intelligent Projects</h3>
                <p className="text-slate-500 leading-relaxed max-w-sm">
                  Organize workloads dynamically. Our automated Kanban boards shift with your team&apos;s real-time momentum, ensuring zero bottlenecks.
                </p>
              </div>
              <div className="w-full md:w-1/2 h-48 bg-slate-50 border border-slate-100 rounded-2xl translate-x-4 translate-y-4 shadow-lg p-4 flex flex-col gap-3">
                 <div className="h-6 w-1/3 bg-slate-200 rounded-md"></div>
                 <div className="flex gap-2"><div className="h-16 w-1/2 bg-white rounded-lg border border-slate-100"></div><div className="h-16 w-1/2 bg-white rounded-lg border border-slate-100"></div></div>
                 <div className="h-10 w-full bg-indigo-50 border border-indigo-100 rounded-lg"></div>
              </div>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1, ease: customEase }}
            className="col-span-1 bg-slate-50 rounded-[2.5rem] p-2 border border-slate-200/60 shadow-sm"
          >
            <div className="bg-white rounded-[calc(2.5rem-8px)] h-full p-10 flex flex-col relative shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Enterprise RBAC</h3>
              <p className="text-slate-500 leading-relaxed">
                Granular control over who sees what. Military-grade permission layers for managers and members.
              </p>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: customEase }}
            className="col-span-1 bg-slate-50 rounded-[2.5rem] p-2 border border-slate-200/60 shadow-sm"
          >
            <div className="bg-white rounded-[calc(2.5rem-8px)] h-full p-10 flex flex-col relative shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">WebSocket Magic</h3>
              <p className="text-slate-500 leading-relaxed">
                Experience zero-latency updates. When a task shifts globally, your screen updates instantly without refreshing.
              </p>
            </div>
          </motion.div>

          {/* Card 4: Spans 2 cols */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1, ease: customEase }}
            className="md:col-span-2 bg-slate-900 rounded-[2.5rem] p-2 border border-slate-800 shadow-xl"
          >
            <div className="bg-slate-950 rounded-[calc(2.5rem-8px)] h-full p-10 flex flex-col md:flex-row gap-8 items-center justify-between overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent blur-3xl rounded-full opacity-50" />
              <div className="flex-1 z-10">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Executive Dashboards</h3>
                <p className="text-slate-400 leading-relaxed max-w-sm">
                  Deep analytics providing a bird&apos;s eye view. Track member output, velocity trends, and upcoming bottlenecks natively.
                </p>
              </div>
              <div className="w-full md:w-1/2 h-48 bg-slate-900 border border-slate-800 rounded-2xl translate-x-4 shadow-2xl p-6 relative z-10">
                 <div className="flex items-end gap-3 h-full pb-4 border-b border-slate-800">
                    <div className="w-1/5 bg-primary/40 rounded-t-sm h-[40%]"></div>
                    <div className="w-1/5 bg-blue-400/60 rounded-t-sm h-[70%]"></div>
                    <div className="w-1/5 bg-emerald-400/80 rounded-t-sm h-[90%]"></div>
                    <div className="w-1/5 bg-indigo-500/90 rounded-t-sm h-[100%]"></div>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const TargetAudience = () => {
  return (
    <section id="solutions" className="py-32 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-16 items-start">
          <div className="w-full md:w-1/3 sticky top-32">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
              Built for those who lead.
            </h2>
            <p className="text-lg text-slate-500 mb-8">
              Whether you&apos;re steering a massive enterprise shift, or launching a nimble startup product, Epoch calibrates to your methodology.
            </p>
          </div>
          
          <div className="w-full md:w-2/3 space-y-8">
            {[
              { title: "For Agency Executives", desc: "Oversee multiple client portfolios simultaneously without losing the microscopic details of individual deliverables.", icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
              { title: "For Product Managers", desc: "Translate high-level roadmaps into actionable granular sprints, instantly communicating changes to development pods.", icon: Layers, color: "text-purple-600", bg: "bg-purple-100" },
              { title: "For Development Teams", desc: "Escape the noise. See exactly what you need to build today with focused, distraction-free member dashboards.", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100" }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: customEase }}
                className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow group"
              >
                <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500`}>
                  <item.icon className={`w-7 h-7 ${item.color}`} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-500 text-lg leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-32 bg-slate-950 text-white overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[150px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 relative z-10 text-center">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Loved by the best.</h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">From boutique design agencies to global engineering firms, teams are executing faster with Epoch.</p>
      </div>

      <div className="flex gap-6 px-4 md:px-8 overflow-x-auto pb-12 snap-x snap-mandatory scrollbar-hide relative z-10">
        <div className="min-w-[5vw] shrink-0"></div>
        {[
          { name: "Sarah Jenkins", role: "VP of Engineering at Nexus", quote: "We migrated 400 developers to Epoch over a weekend. The WebSocket synchronization alone reduced our meeting times by 20%." },
          { name: "Marcus Chen", role: "Creative Director at Studio V", quote: "Finally, a project tool that doesn't look like an excel spreadsheet. The visual fidelity matches the quality of work our teams produce." },
          { name: "Elena Rostova", role: "Head of Product", quote: "The separation between Manager analytics and Member dashboards is flawless. Everyone sees exactly what matters to their specific mandate." },
          { name: "David Foster", role: "Agency Founder", quote: "Client invitations take 3 seconds. Role-based access ensures they see the progress without messing with the source data. Incredible." },
        ].map((item, i) => (
          <div key={i} className="w-[85vw] sm:w-[400px] shrink-0 snap-center bg-slate-900/50 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem]">
            <div className="flex gap-1 mb-6">
              {[1,2,3,4,5].map(star => <div key={star} className="w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center text-xs">★</div>)}
            </div>
            <p className="text-xl text-slate-300 font-medium mb-8 leading-relaxed">&quot;{item.quote}&quot;</p>
            <div className="flex items-center gap-4 border-t border-white/10 pt-6">
              <div className="w-12 h-12 rounded-full bg-slate-800 bg-cover bg-center" style={{backgroundImage: `url(https://i.pravatar.cc/150?img=${i+40})`}}></div>
              <div>
                <div className="font-bold">{item.name}</div>
                <div className="text-sm text-slate-500">{item.role}</div>
              </div>
            </div>
          </div>
        ))}
        <div className="min-w-[5vw] shrink-0"></div>
      </div>
    </section>
  )
}

const CTASection = () => {
  return (
    <section className="py-40 bg-white relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8, ease: customEase }}
        >
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 mb-8">
            Ready to reclaim<br />your workflow?
          </h2>
          <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto">
            Join thousands of teams already executing at lightspeed. Setup takes less than 3 minutes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup" className="group flex items-center justify-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-full text-xl font-bold hover:bg-black transition-all hover:scale-[0.98] active:scale-95 duration-300">
              Get Started for Free
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

const Footer = () => {
  return (
    <footer className="bg-slate-50 pt-24 pb-12 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-24">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold tracking-tight text-2xl">Epoch.</span>
            </div>
            <p className="text-slate-500 max-w-sm mb-8">
              The high-velocity operations platform that scales seamlessly from visionary startups to global enterprises.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 mb-6">Product</h4>
            <ul className="space-y-4 text-slate-500">
              <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Changelog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6">Company</h4>
            <ul className="space-y-4 text-slate-500">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6">Legal</h4>
            <ul className="space-y-4 text-slate-500">
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-slate-200">
          <p className="text-slate-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Epoch Technologies Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-400 font-mono">
            <span>Status: All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function LandingPage() {
   return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900 selection:bg-primary/20">
      <FloatingNav />
      <HeroSection />
      <BentoFeatures />
      <TargetAudience />
      <Testimonials />
      <CTASection />
      <Footer />
    </div>
   )
}
