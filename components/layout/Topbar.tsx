"use client";

import {
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  HelpCircle,
  Bell,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TopbarProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobileSidebar: () => void;
  pageHeader?: ReactNode;
}

export default function Topbar({
  sidebarCollapsed,
  onToggleSidebar,
  onOpenMobileSidebar,
  pageHeader,
}: TopbarProps) {
  return (
    <header className="flex h-[52px] shrink-0 items-center gap-2 bg-white px-3 sm:h-[60px]">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleSidebar}
        className="hidden text-foreground hover:bg-black/10 lg:inline-flex"
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {sidebarCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
      </Button>

      {pageHeader}

      {/* Right side */}
      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-foreground hover:bg-black/10"
          aria-label="Help"
        >
          <HelpCircle />
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          className="relative text-foreground hover:bg-black/10"
          aria-label="Notifications"
        >
          <Bell />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-red-500" />
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          className="text-foreground hover:bg-black/10"
          aria-label="AI tools"
        >
          <Sparkles />
        </Button>

        <Button
          variant="ghost"
          className="h-8 gap-1 rounded-full px-1.5 text-foreground hover:bg-black/10"
          aria-label="Open account menu"
        >
          <Avatar size="sm" className="border-2 border-black/10">
            <AvatarFallback className="bg-black/10 text-foreground text-xs">
              M
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-28 truncate text-xs font-medium sm:inline">
            Madhur Rastogi
          </span>
          <ChevronDown className="hidden sm:inline" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMobileSidebar}
          className="text-foreground hover:bg-black/10 lg:hidden"
          aria-label="Menu"
        >
          <Menu />
        </Button>
      </div>
    </header>
  );
}
