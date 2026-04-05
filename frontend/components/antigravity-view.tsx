"use client";

import {
  Zap,
  Activity,
  Cpu,
  Layers,
  Sparkles,
  ShieldCheck,
  Globe,
  Terminal,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * AntigravityView — The core intelligence dashboard for the Deck.
 */
export function AntigravityView() {
  return (
    <div className='flex-1 flex flex-col p-6 sm:p-10 overflow-y-auto bg-background/50'>
      <div className='max-w-6xl mx-auto w-full space-y-12'>
        {/* Header Section */}
        <div className='flex flex-col sm:flex-row sm:items-end justify-between gap-6'>
          <div className='space-y-2'>
            <div className='flex items-center gap-3 text-primary'>
              <div className='p-2 rounded-xl bg-primary/10 shadow-[0_0_20px_rgba(var(--primary),0.2)]'>
                <Zap className='h-6 w-6' />
              </div>
              <h1 className='text-3xl font-bold tracking-tight'>
                Antigravity Core
              </h1>
            </div>
            <p className='text-muted-foreground text-lg max-w-2xl'>
              The central nervous system of your development environment.
              Monitor intelligence flow, manage agent protocols, and orchestrate
              complex tasks.
            </p>
          </div>

          <div className='flex items-center gap-3'>
            <Button className='rounded-xl gap-2 font-semibold shadow-lg shadow-primary/20'>
              <Rocket className='h-4 w-4' /> Launch Protocol
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {[
            {
              label: "Neural Load",
              value: "14%",
              icon: Activity,
              color: "text-emerald-400",
              bg: "bg-emerald-500/10",
            },
            {
              label: "Agent Uptime",
              value: "99.9%",
              icon: ShieldCheck,
              color: "text-blue-400",
              bg: "bg-blue-500/10",
            },
            {
              label: "Global Reaches",
              value: "1.2k",
              icon: Globe,
              color: "text-purple-400",
              bg: "bg-purple-500/10",
            },
            {
              label: "Active Context",
              value: "42GB",
              icon: Layers,
              color: "text-orange-400",
              bg: "bg-orange-500/10",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className='p-6 rounded-2xl border bg-card/30 backdrop-blur-sm space-y-4 hover:border-primary/20 transition-all'
            >
              <div className='flex items-center justify-between'>
                <div className={cn("p-2 rounded-lg", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div className='h-1.5 w-1.5 rounded-full bg-primary animate-pulse' />
              </div>
              <div className='space-y-1'>
                <p className='text-muted-foreground text-xs font-semibold uppercase tracking-wider'>
                  {stat.label}
                </p>
                <p className='text-2xl font-bold'>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Sections */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main Status Card */}
          <div className='lg:col-span-2 p-8 rounded-3xl border bg-linear-to-br from-primary/5 via-transparent to-transparent relative overflow-hidden group'>
            <div className='absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform'>
              <Zap className='h-48 w-48' />
            </div>

            <div className='relative space-y-8'>
              <div className='space-y-2'>
                <h3 className='text-xl font-bold flex items-center gap-2'>
                  <Sparkles className='h-5 w-5 text-amber-400' />
                  System Intelligence
                </h3>
                <p className='text-muted-foreground'>
                  All core protocols are operating within nominal parameters.
                  Your IDE integration is optimized for the current project
                  context.
                </p>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='p-4 rounded-2xl bg-black/20 border border-white/5 space-y-3'>
                  <div className='flex items-center gap-2 text-primary font-semibold text-sm'>
                    <Cpu className='h-4 w-4' />
                    Logic Engine
                  </div>
                  <div className='w-full h-2 rounded-full bg-muted overflow-hidden'>
                    <div className='h-full bg-primary w-[75%]' />
                  </div>
                  <p className='text-[10px] text-muted-foreground uppercase tracking-widest font-bold'>
                    Optimized for speed
                  </p>
                </div>
                <div className='p-4 rounded-2xl bg-black/20 border border-white/5 space-y-3'>
                  <div className='flex items-center gap-2 text-emerald-400 font-semibold text-sm'>
                    <Terminal className='h-4 w-4' />
                    LS Diagnostics
                  </div>
                  <div className='w-full h-2 rounded-full bg-muted overflow-hidden'>
                    <div className='h-full bg-emerald-500 w-[92%]' />
                  </div>
                  <p className='text-[10px] text-muted-foreground uppercase tracking-widest font-bold'>
                    Zero latency detected
                  </p>
                </div>
              </div>

              <Button
                variant='outline'
                className='rounded-xl border-primary/20 hover:bg-primary/5'
              >
                View Detail Logs
              </Button>
            </div>
          </div>

          {/* Quick Stats / Activity */}
          <div className='p-8 rounded-3xl border bg-card/20 space-y-6'>
            <h3 className='text-lg font-bold'>Recent Activity</h3>
            <div className='space-y-6'>
              {[
                {
                  time: "2m ago",
                  event: "Workspace Re-indexed",
                  desc: "Personal/AG-Deck",
                },
                {
                  time: "15m ago",
                  event: "Gemini Response",
                  desc: "Code Refactoring Task",
                },
                {
                  time: "1h ago",
                  event: "Session Resumed",
                  desc: "Ref: #3372946c",
                },
                {
                  time: "3h ago",
                  event: "System Check",
                  desc: "All protocols green",
                },
              ].map((item, i) => (
                <div key={i} className='flex gap-4'>
                  <div className='w-px bg-border relative'>
                    <div className='absolute top-2 left-[-3px] w-2 h-2 rounded-full bg-primary/40' />
                  </div>
                  <div className='space-y-1 pb-2'>
                    <p className='text-xs text-muted-foreground'>{item.time}</p>
                    <p className='text-sm font-semibold'>{item.event}</p>
                    <p className='text-[10px] text-muted-foreground uppercase tracking-tight'>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
