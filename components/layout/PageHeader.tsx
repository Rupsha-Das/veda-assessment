"use client";

import { ArrowLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  icon?: LucideIcon;
  onBack?: () => void;
  className?: string;
}

export default function PageHeader({
  title,
  icon: Icon,
  onBack,
  className,
}: PageHeaderProps) {
  const arrow = (
    <ArrowLeft
      className={cn(
        "size-4 shrink-0",
        onBack ? "text-foreground" : "text-muted-foreground",
      )}
      aria-hidden="true"
    />
  );

  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex size-8 items-center justify-center rounded-md p-0 text-foreground transition-colors hover:bg-black/10 sm:size-auto sm:p-0.5"
          aria-label="Back"
        >
          {arrow}
        </button>
      ) : (
        arrow
      )}
      {Icon && (
        <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      )}
      <span className="truncate text-sm font-medium text-[#858585]">{title}</span>
    </div>
  );
}
