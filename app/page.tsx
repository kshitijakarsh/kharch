"use client";

import React, { useState, useEffect } from 'react';
import { SummaryCard }  from "@/components/dashboard/SummaryCard";
import { ChartSection } from "@/components/dashboard/ChartSection";
import { AIInput }      from "@/components/ai/AIInput";
import { ChatMessage }  from "@/components/ai/ChatMessage";
import { ExpenseTable } from "@/components/dashboard/ExpenseTable";
import {
  Wallet, Calendar, CreditCard, Bot, Sparkles, X, TrendingUp,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn }    from "@/lib/utils";

/* ─── Types ─────────────────────────────────────────────────── */
interface Message {
  role: 'user' | 'assistant';
  content: string;
  data?: any;
}

/* ─── Component ──────────────────────────────────────────────── */
export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your Kharch Assistant. Use commands like /add 100 food coffee to record your spending.' },
  ]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [stats,    setStats]    = useState<any>({ week: [], month: [], daily: [], salary: 0 });
  const [loading,  setLoading]  = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loginCode,  setLoginCode]  = useState('');
  const [authError,  setAuthError]  = useState('');

  /* ── Data fetching ─────────────────────────────────────────── */
  const fetchData = async () => {
    try {
      const [expRes, statRes] = await Promise.all([
        fetch('/api/expenses'),
        fetch('/api/stats'),
      ]);
      const expData  = await expRes.json();
      const statData = await statRes.json();
      if (Array.isArray(expData))          setExpenses(expData);
      if (statData.week && statData.month) setStats(statData);
    } catch (e) { console.error(e); }
  };

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) { setIsLoggedIn(true); fetchData(); }
      else        { setIsLoggedIn(false); }
    } catch { setIsLoggedIn(false); }
    finally  { setLoading(false); }
  };

  useEffect(() => { checkAuth(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Derived values ────────────────────────────────────────── */
  const totalSpent = stats.month.reduce((a: number, c: any) => a + parseFloat(c.total),  0);
  const weekSpent  = stats.week .reduce((a: number, c: any) => a + parseFloat(c.total),  0);
  const grandTotal = expenses   .reduce((a: number, c: any) => a + parseFloat(c.amount), 0);
  const salary     = stats.salary ?? 0;
  const burnRate   = salary > 0 ? (totalSpent / salary) * 100 : 0;
  const pieData    = stats.month.map((s: any) => ({ name: s.category, value: parseFloat(s.total) }));
  const lineData   = (stats.daily ?? []).map((s: any) => ({ date: s.day, amount: parseFloat(s.total) }));

  /* ── Handlers ──────────────────────────────────────────────── */
  const handleVerify = async () => {
    setAuthError('');
    try {
      const res    = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: loginCode }),
      });
      const result = await res.json();
      if (result.success) { setIsLoggedIn(true); fetchData(); }
      else                { setAuthError(result.error || 'Invalid code'); }
    } catch { setAuthError('Failed to connect to server'); }
  };

  const handleSendMessage = async (content: string) => {
    setMessages(prev => [...prev, { role: 'user', content }]);
    try {
      const res    = await fetch('/api/ai/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content }),
      });
      const result = await res.json();
      if (result.success) {
        const reply = result.type === 'salary_update'
          ? result.message
          : `Recorded ₹${result.expense.amount} for ${result.expense.category}.`;
        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        fetchData();
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "Invalid command. Try: /add 150 food snacks" }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection lost. Please try again.' }]);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsLoggedIn(false);
  };

  /* ─── Loading ────────────────────────────────────────────────── */
  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-zinc-950">
      <Bot className="animate-pulse text-zinc-100" size={40} />
    </div>
  );

  /* ─── Login / Landing ────────────────────────────────────────── */
  if (!isLoggedIn) return (
    <div className="min-h-screen bg-zinc-950 selection:bg-zinc-100 selection:text-zinc-900">

      {/* Header */}
      <header className="sticky top-0 z-50 flex h-20 items-center justify-between px-8 lg:px-16 bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900">
            <Bot size={18} />
          </div>
          <span className="font-serif text-xl text-zinc-100">Kharch</span>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-5xl px-8 lg:px-16 py-32 text-center">
        <h1 className="text-7xl lg:text-9xl font-serif text-zinc-50 leading-[0.85] tracking-tighter mb-12">
          Financial clarity, <br /> recorded with poise.
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-16">
          A minimalist financial journal driven by simple commands. Private, structured, and entirely controlled by you.
        </p>

        {/* Login card */}
        <div className="max-w-md mx-auto">
          <div className="p-10 border border-zinc-800 rounded-2xl bg-zinc-900">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6">
              Enter Verification Code
            </p>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="000 000"
                maxLength={6}
                value={loginCode}
                onChange={(e) => setLoginCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loginCode.length === 6 && handleVerify()}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-5 text-center text-4xl font-bold text-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-all placeholder:text-zinc-700"
              />
              {authError && (
                <p className="text-xs text-red-400">{authError}</p>
              )}
              <Button
                className="w-full bg-zinc-100 py-8 text-sm font-bold text-zinc-900 hover:bg-zinc-300 rounded-xl transition-colors"
                disabled={loginCode.length !== 6}
                onClick={handleVerify}
              >
                Access Journal
              </Button>
            </div>
            <p className="text-[10px] text-zinc-600 mt-8 uppercase tracking-widest">
              Send /code to Kharch Bot on Telegram
            </p>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-16 px-8 lg:px-16 py-32 border-t border-zinc-800">
        {[
          { title: 'Command Driven',   desc: 'Record expenses instantly with simple shortcuts like /add. No complex forms needed.' },
          { title: 'Editorial Reports',  desc: 'No loud charts. Just clean, bordered visualisations that tell a story about your capital.' },
          { title: 'Absolute Privacy',   desc: 'Code-only login and isolated data ensures your finances remain yours alone.' },
        ].map((f, i) => (
          <div key={i} className="space-y-4">
            <h3 className="text-3xl font-serif text-zinc-100 leading-none">{f.title}</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );

  /* ─── Dashboard ──────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-zinc-950 selection:bg-zinc-100 selection:text-zinc-900">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800">
        <div className="max-w-6xl mx-auto h-16 flex items-center justify-between px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900">
              <Bot size={18} />
            </div>
            <span className="font-serif text-lg text-zinc-100">Kharch</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="h-8 w-8 rounded-full border border-zinc-700 flex items-center justify-center text-[10px] font-bold bg-zinc-800 text-zinc-100">
              KA
            </div>
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="text-[10px] font-bold text-zinc-500 hover:text-red-400 transition-colors uppercase tracking-widest"
            >
              Log Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-8 pb-48">
        <section id="dashboard" className="py-20 space-y-24">

          {/* ── Your Capital ────────────────────────────────────── */}
          <div className="space-y-12">
            <div className="flex items-end justify-between border-b border-zinc-800 pb-8">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Financial Summary
                </span>
                <h1 className="text-5xl font-serif text-zinc-50 leading-none">
                  Your Capital
                </h1>
              </div>

              <div className="flex gap-12 text-right">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Salary</p>
                  <p className="text-2xl font-serif text-zinc-100 tabular-nums">
                    ₹{salary.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Burn Rate</p>
                  <p className={cn(
                    'text-2xl font-serif tabular-nums',
                    burnRate > 80 ? 'text-red-400' : 'text-zinc-100',
                  )}>
                    {burnRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <SummaryCard title="Monthly"  value={`₹${totalSpent.toLocaleString()}`} icon={Wallet}     color="text-zinc-300" />
              <SummaryCard title="Weekly"   value={`₹${weekSpent .toLocaleString()}`} icon={Calendar}   color="text-zinc-400" />
              <SummaryCard title="Total"    value={`₹${grandTotal.toLocaleString()}`} icon={CreditCard} color="text-zinc-500" />
              <SummaryCard title="Salary"   value={`₹${salary    .toLocaleString()}`} icon={TrendingUp} color="text-zinc-300" />
            </div>

            {/* Charts */}
            <div className="border border-zinc-800 rounded-2xl p-10 bg-zinc-900/30">
              <ChartSection lineData={lineData} pieData={pieData} />
            </div>
          </div>

          {/* ── Ledger ──────────────────────────────────────────── */}
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
              <h2 className="text-3xl font-serif text-zinc-100">Recent Ledger</h2>
              <button className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:text-zinc-100 transition-colors">
                Export CSV
              </button>
            </div>
            <ExpenseTable expenses={expenses} />
          </div>

        </section>
      </main>

      {/* ── Floating AI Assistant ──────────────────────────────── */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-6">

        {/* Chat window */}
        <div className={cn(
          "mb-4 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 transition-all duration-500 ease-in-out shadow-2xl shadow-black/40",
          isChatOpen
            ? "h-[480px] opacity-100 scale-100"
            : "h-0 opacity-0 scale-95 pointer-events-none"
        )}>
          <div className="flex h-full flex-col">
            {/* Chat header */}
            <div className="flex items-center justify-between border-b border-zinc-800 px-8 py-5 bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-zinc-100 text-zinc-900 flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-100">Kharch Assistant</h2>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Command Based</p>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
              {messages.map((msg, i) => (
                <ChatMessage key={i} {...msg} />
              ))}
            </div>
          </div>
        </div>

        {/* Input bar */}
        <div
          onClick={() => !isChatOpen && setIsChatOpen(true)}
          className={cn(
            "group flex h-20 w-full items-center gap-4 rounded-3xl border border-zinc-800 bg-zinc-900/90 px-6 backdrop-blur-xl transition-all duration-300",
            !isChatOpen && "cursor-pointer hover:border-zinc-600 hover:scale-[1.01] active:scale-[0.99]"
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-900 transition-transform group-hover:rotate-12">
            <Bot size={20} />
          </div>

          {isChatOpen ? (
            <AIInput onSendMessage={handleSendMessage} />
          ) : (
            <div className="flex flex-1 items-center justify-between">
              <span className="text-sm text-zinc-500">
                Type /add to record an expense…
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest border border-zinc-800 bg-zinc-900 px-2 py-1 rounded-md">
                  ⌘ K
                </span>
                <Sparkles size={14} className="text-zinc-600" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
