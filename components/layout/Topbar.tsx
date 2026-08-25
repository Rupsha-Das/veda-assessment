"use client";

import {
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  ChevronLeft,
  HelpCircle,
  Bell,
  Sparkles,
  ChevronDown,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TopbarProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobileSidebar: () => void;
}

function IconBtn({
  className,
  label,
  children,
  onClick,
}: {
  className?: string;
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-gray-100 hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

export default function Topbar({
  sidebarCollapsed,
  onToggleSidebar,
  onOpenMobileSidebar,
}: TopbarProps) {
  return (
    <header className="flex h-[60px] shrink-0 items-center gap-1 border-b border-[--color-border] bg-white px-3">
      {/* Left */}
      <IconBtn label="Menu" onClick={onOpenMobileSidebar} className="lg:hidden">
        <Menu className="size-5" />
      </IconBtn>
      <IconBtn
        label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        onClick={onToggleSidebar}
        className="hidden lg:inline-flex"
      >
        {sidebarCollapsed ? (
          <PanelLeftOpen className="size-5" />
        ) : (
          <PanelLeftClose className="size-5" />
        )}
      </IconBtn>
      <IconBtn label="Back" className="hidden lg:inline-flex">
        <ChevronLeft className="size-5" />
      </IconBtn>
      <div className="hidden items-center gap-1.5 text-sm font-medium text-foreground lg:flex">
        <FileCheck className="size-4 text-muted-foreground" />
        Exams
      </div>

      {/* Right */}
      <div className="ml-auto flex items-center gap-0.5">
        <IconBtn label="Help">
          <HelpCircle className="size-5" />
        </IconBtn>
        <IconBtn label="Notifications" className="relative">
          <Bell className="size-5" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-orange-400" />
        </IconBtn>
        <IconBtn label="AI" className="text-orange-500 hover:text-orange-600">
          <Sparkles className="size-5" />
        </IconBtn>
        <button className="ml-1 flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 transition-colors hover:bg-gray-100">
          <div className="flex size-8 items-center justify-center rounded-full bg-[--color-veda-dark]">
            <svg
              viewBox="0 0 24 24"
              className="size-4 text-white"
              fill="currentColor"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <span className="hidden text-sm font-medium text-foreground md:inline">
            Madhur Rastogi
          </span>
          <ChevronDown className="hidden size-4 text-muted-foreground md:inline" />
        </button>
      </div>
    </header>
  );
}
