import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  color?: string;
}

export function SummaryCard({ title, value, icon: Icon, color, trend }: SummaryCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6">
      <div className="flex items-center justify-between mb-6">
        {/*
          Light: white bg, icon coloured by the `color` prop (text-zinc-* classes).
          Dark:  subtle zinc-800 fill so the icon has contrast on the dark surface.
        */}
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl",
          "bg-white dark:bg-zinc-800",
          "border border-zinc-200 dark:border-zinc-700",
          color ?? "text-zinc-500 dark:text-zinc-400"
        )}>
          <Icon size={20} />
        </div>

        {trend && (
          <span className={cn(
            "text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-widest",
            trend.startsWith('+')
              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
          )}>
            {trend}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{title}</p>
        <h3 className="text-3xl font-serif text-zinc-900 dark:text-zinc-50">{value}</h3>
      </div>
    </div>
  );
}
