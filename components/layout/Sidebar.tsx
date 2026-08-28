"use client";

import {
  Home,
  Presentation,
  ClipboardList,
  FileCheck,
  BookOpen,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

function Logo() {
  return (
    <svg viewBox="0 0 40 40" className="size-9" aria-hidden="true">
      <rect width="40" height="40" rx="10" fill="#292929" />
      <path
        d="M12 28 L20 10 L28 28 L24 28 L20 18 L16 28 Z"
        fill="white"
      />
      <circle cx="30" cy="12" r="3" fill="white" opacity="0.6" />
    </svg>
  );
}

const NAV_ITEMS = [
  { label: "Home", icon: Home, active: false },
  { label: "My Classroom", icon: Presentation, active: false },
  { label: "Assignments", icon: ClipboardList, active: false },
  { label: "Exams", icon: FileCheck, active: true },
  { label: "My Library", icon: BookOpen, active: false },
];

function NavList({
  collapsed,
  onSelect,
}: {
  collapsed: boolean;
  onSelect?: () => void;
}) {
  return (
    <nav aria-label="Main navigation" className="flex flex-col gap-0.5 px-3">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.label}
          onClick={onSelect}
          aria-current={item.active ? "page" : undefined}
          className={cn(
            "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
            item.active
              ? "bg-[#F1F1F1] text-foreground"
              : "text-muted-foreground hover:bg-gray-50 hover:text-foreground",
          )}
        >
          <item.icon
            className={cn(
              "size-[18px] shrink-0",
              item.active
                ? "text-foreground"
                : "text-muted-foreground group-hover:text-foreground",
            )}
          />
          {!collapsed && <span className="truncate">{item.label}</span>}
        </button>
      ))}
    </nav>
  );
}

function SchoolProfile({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[--color-border] bg-white p-3 shadow-sm">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50">
        <svg viewBox="0 0 40 40" className="size-7" aria-hidden="true">
          <circle cx="20" cy="20" r="18" fill="#16a34a" opacity="0.15" />
          <circle cx="20" cy="20" r="14" fill="#16a34a" opacity="0.25" />
          <text
            x="20"
            y="24"
            textAnchor="middle"
            fontSize="11"
            fontWeight="bold"
            fill="#16a34a"
          >
            DPS
          </text>
        </svg>
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold leading-tight text-foreground">
            Delhi Public School
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            Bokaro Steel City
          </p>
        </div>
      )}
    </div>
  );
}

export default function Sidebar({
  collapsed,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          "hidden flex-col rounded-r-3xl border-r border-[--color-border] bg-white shadow-sm transition-all duration-200 lg:flex",
          collapsed ? "w-[68px]" : "w-64",
        )}
      >
        <div className="flex h-[60px] items-center gap-2.5 px-4">
          <Logo />
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight text-foreground">
              VedaAI
            </span>
          )}
        </div>

        {!collapsed ? (
          <div className="mx-3 mt-2 mb-1 flex items-center gap-2.5 rounded-full border-2 border-[#ff633d] bg-[#292929] px-3.5 py-2.5 text-[13px] font-medium text-white">
            <Sparkles className="size-4 shrink-0 text-[#ff633d]" />
            AI Teacher&apos;s Toolkit
          </div>
        ) : (
          <div className="mx-auto mt-2 mb-1 flex size-9 items-center justify-center rounded-full border-2 border-[#ff633d] bg-[#292929]">
            <Sparkles className="size-4 text-[#ff633d]" />
          </div>
        )}

        <div className="mt-3 flex-1">
          <NavList collapsed={collapsed} />
        </div>

        {!collapsed && (
          <div className="mx-3 mb-1 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-gray-50 hover:text-foreground">
            <Settings className="size-[18px] shrink-0" />
            <span>Settings</span>
          </div>
        )}

        <div className="mx-3 mb-4">
          <SchoolProfile collapsed={collapsed} />
        </div>
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onCloseMobile}
          />
          <aside className="absolute inset-y-0 left-0 z-50 flex w-64 flex-col rounded-r-3xl bg-white shadow-xl animate-slide-in-left">
            <div className="flex h-[60px] items-center gap-2.5 px-4">
              <Logo />
              <span className="text-lg font-bold tracking-tight text-foreground">
                VedaAI
              </span>
            </div>
            <div className="mx-3 mt-2 mb-1 flex items-center gap-2.5 rounded-full border-2 border-[#ff633d] bg-[#292929] px-3.5 py-2.5 text-[13px] font-medium text-white">
              <Sparkles className="size-4 shrink-0 text-[#ff633d]" />
              AI Teacher&apos;s Toolkit
            </div>
            <div className="mt-3 flex-1">
              <NavList collapsed={false} onSelect={onCloseMobile} />
            </div>
            <div className="mx-3 mb-1 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground">
              <Settings className="size-[18px] shrink-0" />
              <span>Settings</span>
            </div>
            <div className="mx-3 mb-4">
              <SchoolProfile collapsed={false} />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
