"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onBack?: () => void;
}

export default function DashboardLayout({
  children,
  sidebarCollapsed,
  onToggleSidebar,
  onBack,
}: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    if (mobileOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={onToggleSidebar}
          onOpenMobileSidebar={() => setMobileOpen(true)}
          onBack={onBack}
        />
        <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
