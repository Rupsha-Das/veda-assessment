"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  pageHeader?: React.ReactNode;
}

export default function DashboardLayout({
  children,
  sidebarCollapsed,
  onToggleSidebar,
  pageHeader,
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
          pageHeader={pageHeader}
        />
        <main className="relative min-h-0 flex-1 overflow-y-auto bg-[linear-gradient(180deg,#f7f7f7_0%,#ededed_46%,#c7c7c7_100%)]">
          {children}
        </main>
      </div>
    </div>
  );
}
