import React from 'react';
import { Bot, User } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  data?: any;
}

export function ChatMessage({ role, content, data }: ChatMessageProps) {
  const isAssistant = role === 'assistant';

  return (
    <div className={cn(
      "flex w-full gap-4 p-5 rounded-2xl border transition-colors",
      isAssistant
        ? "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
        : "bg-white dark:bg-zinc-950 border-zinc-100 dark:border-zinc-900"
    )}>
      {/* Avatar */}
      <div className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
        isAssistant
          ? "bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100 text-white dark:text-zinc-900"
          : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400"
      )}>
        {isAssistant ? <Bot size={15} /> : <User size={15} />}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 min-w-0">
        <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
          {content}
        </p>
        {data && (
          <div className="mt-3 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
              <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">Metadata</span>
            </div>
            <pre className="text-[10px] font-mono text-zinc-500 leading-relaxed overflow-x-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
