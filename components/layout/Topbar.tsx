"use client";

import {
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  ChevronLeft,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TopbarProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobileSidebar: () => void;
  onBack?: () => void;
}

export default function Topbar({
  sidebarCollapsed,
  onToggleSidebar,
  onOpenMobileSidebar,
  onBack,
}: TopbarProps) {
  return (
    <header className="flex h-[52px] shrink-0 items-center gap-2 bg-[#292929] px-3 sm:h-[60px]">
      {/* Left side */}
      {onBack && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-white hover:bg-white/10 lg:hidden"
          aria-label="Back"
        >
          <ChevronLeft />
        </Button>
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleSidebar}
        className="hidden text-white hover:bg-white/10 lg:inline-flex"
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {sidebarCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
      </Button>

      {/* VedaAI branding */}
      <div className="flex items-center gap-2">
        <Avatar size="sm" className="bg-white">
          <AvatarFallback className="bg-white text-[#292929] text-xs font-bold">
            V
          </AvatarFallback>
        </Avatar>
        <span className="text-base font-bold text-white">VedaAI</span>
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-white hover:bg-white/10"
          aria-label="Notifications"
        >
          <Bell />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-red-500" />
        </Button>

        <Avatar size="sm" className="border-2 border-white/20">
          <AvatarFallback className="bg-white/20 text-white text-xs">
            M
          </AvatarFallback>
        </Avatar>

        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMobileSidebar}
          className="text-white hover:bg-white/10 lg:hidden"
          aria-label="Menu"
        >
          <Menu />
        </Button>
      </div>
    </header>
  );
}
