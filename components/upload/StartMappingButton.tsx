"use client";

import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface StartMappingButtonProps {
  disabled: boolean;
  onClick: () => void;
}

export default function StartMappingButton({
  disabled,
  onClick,
}: StartMappingButtonProps) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "group inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold transition-all",
        disabled
          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
          : "bg-[--color-veda-dark] text-white hover:bg-black hover:shadow-lg active:scale-[0.98]",
      )}
    >
      Start Mapping
      <ArrowRight
        className={cn(
          "size-4 transition-transform",
          !disabled && "group-hover:translate-x-0.5",
        )}
      />
    </button>
  );
}
