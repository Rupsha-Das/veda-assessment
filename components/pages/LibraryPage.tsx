"use client";

import {
  BookOpen,
  Search,
  Plus,
  FileText,
  Layers,
  Download,
  Star,
  Folder,
} from "lucide-react";
import AppPage from "@/components/app/AppPage";
import { Badge } from "@/components/ui/badge";

const FOLDERS = [
  { name: "Mathematics", count: 84, color: "#ff633d", soft: "#fff1ec" },
  { name: "Science", count: 76, color: "#16a34a", soft: "#e9f7ee" },
  { name: "English", count: 58, color: "#2563eb", soft: "#eef3ff" },
  { name: "Physics", count: 49, color: "#9333ea", soft: "#f4efff" },
];

const MATERIALS = [
  {
    title: "Quadratic Equations — Notes",
    type: "Notes",
    folder: "Mathematics",
    size: "1.2 MB",
    color: "#ff633d",
    soft: "#fff1ec",
    featured: true,
  },
  {
    title: "Periodic Table — Reference Sheet",
    type: "Worksheet",
    folder: "Science",
    size: "840 KB",
    color: "#16a34a",
    soft: "#e9f7ee",
    featured: false,
  },
  {
    title: "Essay Writing — Sample Paper",
    type: "Sample",
    folder: "English",
    size: "512 KB",
    color: "#2563eb",
    soft: "#eef3ff",
    featured: true,
  },
  {
    title: "Motion — Practice Questions",
    type: "Question Bank",
    folder: "Physics",
    size: "2.1 MB",
    color: "#9333ea",
    soft: "#f4efff",
    featured: false,
  },
  {
    title: "Algebra — Exam Paper 2023",
    type: "Exam Paper",
    folder: "Mathematics",
    size: "3.4 MB",
    color: "#ff633d",
    soft: "#fff1ec",
    featured: false,
  },
  {
    title: "Genetics — Concept Map",
    type: "Diagram",
    folder: "Science",
    size: "640 KB",
    color: "#16a34a",
    soft: "#e9f7ee",
    featured: true,
  },
];

export default function LibraryPage() {
  return (
    <AppPage title="My Library" icon={BookOpen}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-3 sm:p-5 lg:p-6">
        <section className="animate-rise-in flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              My <span className="text-[#ff633d]">Library</span>
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              318 materials across 4 folders
            </p>
          </div>
          <button className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#ff633d] px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#ff633d]/80">
            <Plus className="size-4" />
            Upload material
          </button>
        </section>

        {/* Folders */}
        <section className="grid grid-cols-2 gap-3 sm:gap-3 lg:grid-cols-4">
          {FOLDERS.map((f, i) => (
            <button
              key={f.name}
              className="group animate-rise-in flex items-center gap-3 rounded-xl border border-[--color-border] bg-white p-3 text-left shadow-sm transition-all hover:shadow-md"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105"
                style={{ backgroundColor: f.soft, color: f.color }}
              >
                <Folder className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {f.name}
                </p>
                <p className="text-xs text-muted-foreground">{f.count} items</p>
              </div>
            </button>
          ))}
        </section>

        {/* Search */}
        <section className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search your library"
            className="h-9 w-full rounded-lg border border-[--color-border] bg-white pl-10 pr-3 text-sm text-foreground outline-none focus:border-[#ff633d] focus:ring-2 focus:ring-[#ff633d]/20"
          />
        </section>

        {/* Materials grid */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
          {MATERIALS.map((m, i) => (
            <div
              key={m.title}
              className="group animate-rise-in flex flex-col rounded-xl border border-[--color-border] bg-white p-3.5 shadow-sm transition-all hover:shadow-md"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start justify-between">
                <span
                  className="flex size-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: m.soft, color: m.color }}
                >
                  {iconForType(m.type)}
                </span>
                {m.featured && (
                  <Star className="size-4 fill-[#eab308] text-[#eab308]" />
                )}
              </div>
              <h3 className="mt-2.5 text-sm font-semibold text-foreground">
                {m.title}
              </h3>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {m.folder} · {m.type} · {m.size}
              </p>
              <div className="mt-2.5 flex items-center gap-2 border-t border-[--color-border] pt-2.5">
                <Badge
                  variant="outline"
                  className="bg-[#f7f7f7] text-muted-foreground"
                >
                  <Layers className="size-3" />
                  {m.type}
                </Badge>
                <button
                  className="ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-[#ff633d]"
                >
                  <Download className="size-3.5" />
                  Open
                </button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </AppPage>
  );
}

function iconForType(type: string) {
  if (type === "Diagram") return <Layers className="size-4" />;
  if (type === "Worksheet") return <Download className="size-4" />;
  return <FileText className="size-4" />;
}
