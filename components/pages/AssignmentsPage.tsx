"use client";

import {
  ClipboardList,
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Search,
  Filter,
} from "lucide-react";
import AppPage from "@/components/app/AppPage";
import { Badge } from "@/components/ui/badge";

type Status = "open" | "grading" | "graded" | "draft";

const ASSIGNMENTS: {
  title: string;
  subject: string;
  section: string;
  status: Status;
  submitted: number;
  total: number;
  due: string;
}[] = [
  {
    title: "Quadratic Equations Practice",
    subject: "Mathematics",
    section: "Class 9 · B",
    status: "open",
    submitted: 31,
    total: 42,
    due: "Due in 2 days",
  },
  {
    title: "Motion & Velocity Worksheet",
    subject: "Physics",
    section: "Class 11 · A",
    status: "grading",
    submitted: 34,
    total: 34,
    due: "In grading",
  },
  {
    title: "Essay Structure Exercise",
    subject: "English",
    section: "Class 8 · C",
    status: "graded",
    submitted: 45,
    total: 45,
    due: "Graded",
  },
  {
    title: "Periodic Table Revision",
    subject: "Chemistry",
    section: "Class 10 · A",
    status: "draft",
    submitted: 0,
    total: 38,
    due: "Draft · not published",
  },
  {
    title: "Algebra Fundamentals",
    subject: "Mathematics",
    section: "Class 9 · B",
    status: "graded",
    submitted: 42,
    total: 42,
    due: "Graded",
  },
];

const STATUS_META: Record<
  Status,
  { label: string; icon: typeof FileText; className: string }
> = {
  open: {
    label: "Open",
    icon: Clock,
    className: "bg-[#eef3ff] text-[#2563eb]",
  },
  grading: {
    label: "Grading",
    icon: AlertCircle,
    className: "bg-[#fff4e5] text-[#ea580c]",
  },
  graded: {
    label: "Graded",
    icon: CheckCircle2,
    className: "bg-[#e9f7ee] text-[#16a34a]",
  },
  draft: {
    label: "Draft",
    icon: FileText,
    className: "bg-[#f3f3f3] text-muted-foreground",
  },
};

export default function AssignmentsPage() {
  return (
    <AppPage title="Assignments" icon={ClipboardList}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-3 sm:p-5 lg:p-6">
        <section className="animate-rise-in flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              <span className="text-[#ff633d]">Assignments</span>
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              3 open · 1 in grading · 2 graded
            </p>
          </div>
          <button className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#ff633d] px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#ff633d]/80">
            <Plus className="size-4" />
            New assignment
          </button>
        </section>

        {/* Toolbar */}
        <section className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search assignments"
              className="h-9 w-full rounded-lg border border-[--color-border] bg-white pl-10 pr-3 text-sm text-foreground outline-none focus:border-[#ff633d] focus:ring-2 focus:ring-[#ff633d]/20"
            />
          </div>
          <div className="flex items-center gap-2">
            {["All", "Open", "Grading", "Graded"].map((tab) => (
              <button
                key={tab}
                className={
                  tab === "All"
                    ? "rounded-lg bg-[#292929] px-3 py-1.5 text-sm font-medium text-white"
                    : "rounded-lg border border-[--color-border] bg-white px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                }
              >
                {tab}
              </button>
            ))}
            <button
              className="inline-flex items-center gap-1.5 rounded-lg border border-[--color-border] bg-white px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Filter"
            >
              <Filter className="size-4" />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>
        </section>

        {/* Assignment list */}
        <section className="flex flex-col gap-2.5">
          {ASSIGNMENTS.map((a) => {
            const meta = STATUS_META[a.status];
            const Icon = meta.icon;
            const pct = a.total ? Math.round((a.submitted / a.total) * 100) : 0;
            return (
              <div
                key={a.title}
                className="group flex flex-col gap-2.5 rounded-xl border border-[--color-border] bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:px-4"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#fff1ec] text-[#ff633d]">
                  <FileText className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">
                      {a.title}
                    </h3>
                    <Badge variant="outline" className={meta.className}>
                      <Icon className="size-3" />
                      {meta.label}
                    </Badge>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {a.subject} · {a.section} · {a.due}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4 sm:w-48 sm:flex-col sm:items-end sm:gap-1">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Users className="size-4" />
                    {a.submitted}/{a.total} submitted
                  </div>
                  <div className="flex w-full items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#f3f3f3]">
                      <div
                        className="h-full rounded-full bg-[#ff633d] transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-7 text-right text-xs font-medium text-foreground">
                      {pct}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </AppPage>
  );
}
