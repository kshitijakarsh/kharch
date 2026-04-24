"use client";

import React from 'react';
import { LayoutDashboard, MessageSquare, LogOut, Bot } from 'lucide-react';
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

export function Sidebar({ activeView, onViewChange, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ai', label: 'AI Assistant', icon: MessageSquare },
  ];

  return (
    <aside className="flex h-full w-64 flex-col border-r border-zinc-100 bg-white">
      <div className="flex h-20 items-center px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white">
            <Bot size={18} />
          </div>
          <span className="font-serif text-lg font-medium tracking-tight">Kharch</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-all",
                isActive 
                  ? "bg-zinc-50 text-zinc-900 font-medium" 
                  : "text-zinc-500 hover:bg-zinc-50/50 hover:text-zinc-900"
              )}
            >
              <Icon size={18} className={cn("transition-colors", isActive ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-900")} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-zinc-100 p-4">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </aside>
  );
}
