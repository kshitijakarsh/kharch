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
      "flex w-full gap-4 p-4 rounded-2xl transition-colors",
      isAssistant ? "bg-zinc-50 dark:bg-zinc-900/50" : "bg-transparent"
    )}>
      <div className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
        isAssistant ? "bg-blue-600 text-white border-blue-600" : "bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 dark:border-zinc-700"
      )}>
        {isAssistant ? <Bot size={16} /> : <User size={16} />}
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
          {content}
        </p>
        {data && (
          <div className="mt-2 overflow-hidden rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-black">
            <pre className="text-[11px] font-mono text-zinc-500">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
