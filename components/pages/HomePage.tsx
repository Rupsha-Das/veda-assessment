"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  ClipboardList,
  FileCheck,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import AppPage from "@/components/app/AppPage";
import { Badge } from "@/components/ui/badge";

const STATS = [
  {
    label: "Total Students",
    value: "1,248",
    delta: "+4.2%",
    icon: Users,
    tone: "orange",
  },
  {
    label: "Assignments Graded",
    value: "86%",
    delta: "+2.1%",
    icon: ClipboardList,
    tone: "green",
  },
  {
    label: "Exams Mapped",
    value: "42",
    delta: "+12",
    icon: FileCheck,
    tone: "blue",
  },
  {
    label: "Materials in Library",
    value: "318",
    delta: "+8",
    icon: BookOpen,
    tone: "violet",
  },
] as const;

const TONE_CLASSES: Record<string, string> = {
  orange: "bg-[#fff1ec] text-[#ff633d]",
  green: "bg-[#e9f7ee] text-[#16a34a]",
  blue: "bg-[#eef3ff] text-[#2563eb]",
  violet: "bg-[#f4efff] text-[#9333ea]",
};

interface ActivityItem {
  title: string;
  subject: string;
  type: "graded" | "pending" | "due";
  time: string;
}

const ACTIVITIES: ActivityItem[] = [
  {
    title: "Mathematics — Quadratic Equations",
    subject: "Class 9 · Section B",
    type: "graded",
    time: "12 minutes ago",
  },
  {
    title: "Physics — Motion Concepts",
    subject: "Class 11 · Section A",
    type: "pending",
    time: "1 hour ago",
  },
  {
    title: "English — Essay Structure",
    subject: "Class 8 · Section C",
    type: "due",
    time: "Due tomorrow",
  },
  {
    title: "Chemistry — Periodic Table",
    subject: "Class 10 · Section B",
    type: "graded",
    time: "3 hours ago",
  },
];

const ACTIVITY_META: Record<
  ActivityItem["type"],
  { icon: typeof CheckCircle2; label: string; className: string }
> = {
  graded: {
    icon: CheckCircle2,
    label: "Graded",
    className: "text-[#16a34a] bg-[#e9f7ee]",
  },
  pending: {
    icon: AlertCircle,
    label: "Pending review",
    className: "text-[#ea580c] bg-[#fff4e5]",
  },
  due: {
    icon: Clock,
    label: "Due soon",
    className: "text-[#2563eb] bg-[#eef3ff]",
  },
};

export default function HomePage() {
  return (
    <AppPage title="Home" icon={GraduationCap}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
        {/* Greeting hero */}
        <section className="animate-rise-in">
          <div className="relative overflow-hidden rounded-3xl bg-[#292929] p-6 text-white shadow-sm sm:p-8">
            <div
              className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-[#ff633d]/20 blur-2xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-20 right-24 size-40 rounded-full bg-[#ff633d]/10 blur-2xl"
              aria-hidden="true"
            />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <Badge
                  className="mb-3 border-[#ff633d]/40 bg-[#ff633d]/15 text-[#ff633d]"
                  variant="outline"
                >
                  <Sparkles className="size-3" />
                  Good morning, Madhur
                </Badge>
                <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                  Welcome back to your classroom
                </h1>
                <p className="mt-2 text-sm text-white/70">
                  You have 3 assignments awaiting review and 1 exam ready to
                  map. Everything is right where you left it.
                </p>
              </div>
              <div className="flex shrink-0 gap-2 sm:flex-col">
                <Link
                  href="/exams"
                  className="group inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#ff633d] px-3.5 py-2 text-sm font-medium text-white transition-all hover:bg-[#ff633d]/80"
                >
                  Map an exam
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <Link
                  href="/assignments"
                  className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/10 px-3.5 py-2 text-sm font-medium text-white transition-all hover:bg-white/20"
                >
                  Review assignments
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="animate-rise-in rounded-2xl border border-[--color-border] bg-white p-4 shadow-sm"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div
                className={`mb-3 flex size-10 items-center justify-center rounded-xl ${TONE_CLASSES[stat.tone]}`}
              >
                <stat.icon className="size-5" />
              </div>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {stat.value}
              </p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="flex items-center gap-0.5 text-xs font-medium text-[#16a34a]">
                  <TrendingUp className="size-3" />
                  {stat.delta}
                </span>
                <span className="text-xs text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            </div>
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick actions */}
          <section className="lg:col-span-1">
            <div className="rounded-2xl border border-[--color-border] bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-[--color-border] px-5 py-4">
                <h2 className="font-heading text-sm font-semibold text-foreground">
                  Quick actions
                </h2>
              </div>
              <div className="flex flex-col gap-1 p-3">
                {[
                  {
                    label: "Upload & map an exam",
                    desc: "Extract and match answers with AI",
                    icon: FileCheck,
                    href: "/exams",
                  },
                  {
                    label: "Create an assignment",
                    desc: "Set up a new classroom task",
                    icon: ClipboardList,
                    href: "/assignments",
                  },
                  {
                    label: "Browse the library",
                    desc: "Reuse lesson materials",
                    icon: BookOpen,
                    href: "/library",
                  },
                  {
                    label: "Manage your classroom",
                    desc: "View students and sections",
                    icon: Users,
                    href: "/classroom",
                  },
                ].map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="group flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#f7f7f7] text-[#ff633d]">
                      <action.icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {action.label}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {action.desc}
                      </p>
                    </div>
                    <ArrowUpRight className="size-4 text-muted-foreground transition-colors group-hover:text-[#ff633d]" />
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Recent activity */}
          <section className="lg:col-span-2">
            <div className="rounded-2xl border border-[--color-border] bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-[--color-border] px-5 py-4">
                <h2 className="font-heading text-sm font-semibold text-foreground">
                  Recent activity
                </h2>
                <Link
                  href="/assignments"
                  className="text-xs font-medium text-[#ff633d] hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="divide-y divide-[--color-border]">
                {ACTIVITIES.map((item) => {
                  const meta = ACTIVITY_META[item.type];
                  const Icon = meta.icon;
                  return (
                    <div
                      key={item.title}
                      className="flex items-center gap-3 px-5 py-3.5"
                    >
                      <div
                        className={`flex size-9 shrink-0 items-center justify-center rounded-full ${meta.className}`}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {item.title}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {item.subject} · {item.time}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={meta.className}
                      >
                        {meta.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppPage>
  );
}
