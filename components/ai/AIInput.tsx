"use client";

import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface AIInputProps {
  onSendMessage: (message: string) => void;
}

export function AIInput({ onSendMessage }: AIInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Spent 500 on groceries"
          className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-5 pr-14 text-sm font-medium transition-all focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none placeholder:text-zinc-200 dark:placeholder:text-zinc-700 text-zinc-900 dark:text-zinc-100"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-xl p-2 text-zinc-300 dark:text-zinc-600 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-20"
        >
          <Send size={20} />
        </button>
      </form>
    </div>

  );
}
