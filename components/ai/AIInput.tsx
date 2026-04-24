"use client";

import React, { useState } from 'react';
import { Send, Mic, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface AIInputProps {
  onSendMessage: (message: string) => void;
}

export function AIInput({ onSendMessage }: AIInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="sticky bottom-8 left-0 right-0 mx-auto w-full max-w-2xl px-4 pb-4">
      <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl shadow-zinc-200/50 dark:border-zinc-800 dark:bg-black dark:shadow-none">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2 pl-4">
          <Sparkles className="text-blue-500 shrink-0" size={18} />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Spent 500 on dinner"
            className="flex-1 bg-transparent py-3 text-sm focus:outline-none dark:text-zinc-50"
          />
          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-zinc-400 hover:text-zinc-600">
              <Mic size={18} />
            </Button>
            <Button type="submit" disabled={!input.trim()} className="h-10 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white">
              <Send size={16} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
