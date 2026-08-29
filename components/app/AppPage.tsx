"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/layout/PageHeader";

interface AppPageProps {
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
}

export default function AppPage({ title, icon, children }: AppPageProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <DashboardLayout
      sidebarCollapsed={sidebarCollapsed}
      onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
      pageHeader={<PageHeader title={title} icon={icon} />}
    >
      {children}
    </DashboardLayout>
  );
}
