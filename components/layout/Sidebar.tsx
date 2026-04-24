import React from 'react';
import { LayoutDashboard, ReceiptText, BarChart3, Bot, Settings, LogOut } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: ReceiptText, label: 'Expenses' },
  { icon: BarChart3, label: 'Analytics' },
  { icon: Bot, label: 'AI Assistant' },
  { icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  return (
    <div className="flex h-screen w-64 flex-col border-r bg-white p-4 dark:bg-black">
      <div className="flex items-center gap-2 px-2 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
          <Bot size={20} />
        </div>
        <span className="text-xl font-semibold tracking-tight">Kharch AI</span>
      </div>

      <nav className="mt-8 flex-1 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              item.active 
                ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50" 
                : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
            )}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="border-t pt-4">
        <div className="flex items-center gap-3 rounded-2xl p-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>KA</AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col overflow-hidden text-left">
            <span className="truncate text-sm font-medium">Kshitij Akarsh</span>
            <span className="truncate text-xs text-zinc-500">Pro Plan</span>
          </div>
          <button className="text-zinc-400 hover:text-zinc-900 transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
