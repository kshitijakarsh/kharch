import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendType?: 'up' | 'down' | 'neutral';
  color?: string;
}

export function SummaryCard({ title, value, icon: Icon, trend, trendType, color }: SummaryCardProps) {
  return (
    <Card className="overflow-hidden border-none bg-white shadow-sm dark:bg-zinc-900 transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={cn("rounded-xl p-2.5", color || "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50")}>
            <Icon size={20} />
          </div>
          {trend && (
            <span className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              trendType === 'up' ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" :
              trendType === 'down' ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400" :
              "bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            )}>
              {trend}
            </span>
          )}
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
          <h3 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}
