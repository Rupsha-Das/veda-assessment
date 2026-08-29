"use client";

import {
  Presentation,
  Users,
  Plus,
  Search,
  MoreHorizontal,
  BookOpen,
  FileCheck,
  ClipboardList,
} from "lucide-react";
import AppPage from "@/components/app/AppPage";
import { Badge } from "@/components/ui/badge";

const CLASSES = [
  {
    name: "Class 9 · Section B",
    subject: "Mathematics",
    students: 42,
    color: "#ff633d",
    soft: "#fff1ec",
    stats: [
      { label: "Avg. score", value: "78%" },
      { label: "Assignments", value: "12" },
      { label: "Exams", value: "3" },
    ],
  },
  {
    name: "Class 10 · Section A",
    subject: "Science",
    students: 38,
    color: "#16a34a",
    soft: "#e9f7ee",
    stats: [
      { label: "Avg. score", value: "82%" },
      { label: "Assignments", value: "9" },
      { label: "Exams", value: "2" },
    ],
  },
  {
    name: "Class 11 · Section A",
    subject: "Physics",
    students: 34,
    color: "#2563eb",
    soft: "#eef3ff",
    stats: [
      { label: "Avg. score", value: "74%" },
      { label: "Assignments", value: "15" },
      { label: "Exams", value: "4" },
    ],
  },
  {
    name: "Class 8 · Section C",
    subject: "English",
    students: 45,
    color: "#9333ea",
    soft: "#f4efff",
    stats: [
      { label: "Avg. score", value: "80%" },
      { label: "Assignments", value: "8" },
      { label: "Exams", value: "2" },
    ],
  },
];

const STUDENTS = [
  { name: "Aarav Sharma", section: "Class 9 · B", score: "92%", status: "graded" },
  { name: "Priya Verma", section: "Class 9 · B", score: "88%", status: "graded" },
  { name: "Rohan Gupta", section: "Class 9 · B", score: "—", status: "pending" },
  { name: "Sneha Iyer", section: "Class 9 · B", score: "95%", status: "graded" },
  { name: "Kabir Singh", section: "Class 9 · B", score: "—", status: "pending" },
];

function InitialsAvatar({ name, color, soft }: { name: string; color: string; soft: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
  return (
    <span
      className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
      style={{ backgroundColor: soft, color }}
    >
      {initials}
    </span>
  );
}

export default function ClassroomPage() {
  return (
    <AppPage title="My Classroom" icon={Presentation}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <section className="animate-rise-in flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">
              My <span className="text-[#ff633d]">Classroom</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              4 sections · 159 students across your classes
            </p>
          </div>
          <button
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#ff633d] px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#ff633d]/80"
          >
            <Plus className="size-4" />
            Add section
          </button>
        </section>

        {/* Class cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CLASSES.map((cls, i) => (
            <div
              key={cls.name}
              className="animate-rise-in flex flex-col rounded-2xl border border-[--color-border] bg-white p-4 shadow-sm"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="flex items-start justify-between">
                <span
                  className="flex size-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: cls.soft, color: cls.color }}
                >
                  <BookOpen className="size-5" />
                </span>
                <button
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-gray-50 hover:text-foreground"
                  aria-label="Class options"
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </div>
              <h2 className="mt-3 text-base font-semibold text-foreground">
                {cls.name}
              </h2>
              <p className="text-sm text-muted-foreground">{cls.subject}</p>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="size-3.5" />
                {cls.students} students
              </div>
              <div className="mt-4 grid grid-cols-3 gap-1 rounded-xl bg-[#f7f7f7] p-2 text-center">
                {cls.stats.map((s) => (
                  <div key={s.label}>
                    <p className="text-sm font-semibold text-foreground">
                      {s.value}
                    </p>
                    <p className="text-[10px] leading-tight text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Students */}
          <section className="lg:col-span-2">
            <div className="rounded-2xl border border-[--color-border] bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-[--color-border] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-heading text-sm font-semibold text-foreground">
                  Recent performance
                </h2>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search students"
                    className="h-8 w-full rounded-lg border border-[--color-border] bg-background pl-8 pr-3 text-sm text-foreground outline-none focus:border-[#ff633d] focus:ring-2 focus:ring-[#ff633d]/20 sm:w-56"
                  />
                </div>
              </div>
              <div className="divide-y divide-[--color-border]">
                {STUDENTS.map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center gap-3 px-5 py-3"
                  >
                    <InitialsAvatar
                      name={s.name}
                      color="#ff633d"
                      soft="#fff1ec"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {s.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {s.section}
                      </p>
                    </div>
                    {s.status === "graded" ? (
                      <span className="text-sm font-semibold text-[#16a34a]">
                        {s.score}
                      </span>
                    ) : (
                      <Badge variant="outline" className="bg-[#fff4e5] text-[#ea580c]">
                        Pending
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section summary */}
          <section>
            <div className="rounded-2xl border border-[--color-border] bg-white shadow-sm">
              <div className="border-b border-[--color-border] px-5 py-4">
                <h2 className="font-heading text-sm font-semibold text-foreground">
                  Section overview
                </h2>
              </div>
              <div className="flex flex-col gap-4 p-5">
                <div className="flex items-center gap-3 rounded-xl bg-[#f7f7f7] p-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-[#fff1ec] text-[#ff633d]">
                    <FileCheck className="size-4" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      Exams this week
                    </p>
                    <p className="text-xs text-muted-foreground">
                      2 exams mapped with AI
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-[#f7f7f7] p-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-[#e9f7ee] text-[#16a34a]">
                    <ClipboardList className="size-4" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      Assignments open
                    </p>
                    <p className="text-xs text-muted-foreground">
                      3 tasks still accepting work
                    </p>
                  </div>
                </div>
                <button className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-[--color-border] bg-white px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-gray-50">
                  <Users className="size-4" />
                  Manage sections
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppPage>
  );
}
