"use client";

import React, { useState, useEffect } from 'react';
import { Header } from "@/components/layout/Header";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { ChartSection } from "@/components/dashboard/ChartSection";
import { ExpenseList } from "@/components/dashboard/ExpenseList";
import { AIInput } from "@/components/ai/AIInput";
import { ChatMessage } from "@/components/ai/ChatMessage";
import { Wallet, Calendar, CreditCard, TrendingUp, MessageSquare, LayoutDashboard, Bot, Lock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  data?: any;
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [view, setView] = useState<'chat' | 'dashboard'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your Kharch AI. Just type your expense and I will handle the rest.' }
  ]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ week: [], month: [] });
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        setIsLoggedIn(true);
        fetchData();
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const [expRes, statRes] = await Promise.all([
        fetch('/api/expenses'),
        fetch('/api/stats')
      ]);
      const expData = await expRes.json();
      const statData = await statRes.json();
      if (Array.isArray(expData)) setExpenses(expData);
      if (statData.week && statData.month) setStats(statData);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { checkAuth(); }, []);

  const handleSendMessage = async (content: string) => {
    const userMsg: Message = { role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    try {
      const res = await fetch('/api/ai/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content })
      });
      const result = await res.json();
      if (result.success) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `✅ Recorded ₹${result.expense.amount} in ${result.expense.category}.`,
          data: result.expense
        }]);
        fetchData();
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Something went wrong. Please try again." }]);
    }
  };

  const [loginCode, setLoginCode] = useState('');
  const [authError, setAuthError] = useState('');

  const handleVerify = async () => {
    setAuthError('');
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: loginCode })
      });
      const result = await res.json();
      if (result.success) {
        setIsLoggedIn(true);
        fetchData();
      } else {
        setAuthError(result.error || "Invalid code");
      }
    } catch (e) {
      setAuthError("Failed to connect to server");
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-black">
      <Bot className="animate-pulse text-blue-600" size={48} />
    </div>
  );

  if (!isLoggedIn) return (
    <div className="flex h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/20">
            <Bot size={32} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Login to Kharch AI</h1>
            <p className="text-sm text-zinc-500">
              Message <span className="font-mono font-bold text-blue-600">/code</span> to the Kharch Bot on Telegram to get your login code.
            </p>
          </div>
        </div>

        <div className="space-y-6 rounded-3xl bg-white p-8 shadow-sm border dark:bg-zinc-900">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Verification Code</label>
            <input 
              type="text" 
              placeholder="e.g. 123456"
              maxLength={6}
              value={loginCode}
              onChange={(e) => setLoginCode(e.target.value)}
              className="w-full rounded-xl border bg-zinc-50 px-4 py-4 text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-black"
            />
          </div>
          
          {authError && (
            <p className="text-xs font-medium text-red-500 text-center">{authError}</p>
          )}

          <Button 
            className="w-full bg-blue-600 py-7 text-base font-semibold hover:bg-blue-700 rounded-2xl shadow-lg shadow-blue-500/20"
            disabled={loginCode.length !== 6}
            onClick={handleVerify}
          >
            Sign In
          </Button>
        </div>

        <p className="text-xs text-center text-zinc-400 flex items-center justify-center gap-1">
          <Lock size={12} /> Secure, encrypted per-user data isolation
        </p>
      </div>
    </div>
  );


  const totalSpent = stats.month.reduce((acc: number, curr: any) => acc + parseFloat(curr.total), 0);
  const weekSpent = stats.week.reduce((acc: number, curr: any) => acc + parseFloat(curr.total), 0);
  const pieData = stats.month.map((s: any) => ({ name: s.category, value: parseFloat(s.total) }));
  const lineData = stats.week.map((s: any) => ({ date: s.category.substring(0, 3), amount: parseFloat(s.total) }));

  return (
    <div className="flex h-screen bg-white dark:bg-black overflow-hidden font-sans">
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* Simplified Header */}
        <header className="flex h-16 items-center justify-between border-b px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Bot size={18} />
            </div>
            <span className="font-semibold tracking-tight">Kharch AI</span>
          </div>

          <div className="flex bg-zinc-100 p-1 rounded-xl dark:bg-zinc-900">
            <button 
              onClick={() => setView('chat')}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-lg transition-all",
                view === 'chat' ? "bg-white shadow-sm text-blue-600 dark:bg-black" : "text-zinc-500 hover:text-zinc-900"
              )}
            >
              <MessageSquare size={16} /> Chat
            </button>
            <button 
              onClick={() => setView('dashboard')}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-lg transition-all",
                view === 'dashboard' ? "bg-white shadow-sm text-blue-600 dark:bg-black" : "text-zinc-500 hover:text-zinc-900"
              )}
            >
              <LayoutDashboard size={16} /> Dashboard
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden relative">
          
          {/* Chat View */}
          {view === 'chat' && (
            <div className="h-full flex flex-col max-w-3xl mx-auto w-full relative">
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide pb-32">
                {messages.map((msg, i) => (
                  <ChatMessage key={i} role={msg.role} content={msg.content} data={msg.data} />
                ))}
              </div>
              <AIInput onSendMessage={handleSendMessage} />
            </div>
          )}

          {/* Dashboard View */}
          {view === 'dashboard' && (
            <div className="h-full overflow-y-auto p-6 scrollbar-hide">
              <div className="mx-auto max-w-5xl space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <SummaryCard title="Month" value={`₹${totalSpent}`} icon={Wallet} color="bg-blue-50 text-blue-600" />
                  <SummaryCard title="Week" value={`₹${weekSpent}`} icon={Calendar} color="bg-purple-50 text-purple-600" />
                  <SummaryCard title="Top Category" value={stats.month[0]?.category || "N/A"} icon={CreditCard} color="bg-orange-50 text-orange-600" />
                </div>
                <ChartSection lineData={lineData} pieData={pieData} />
                <ExpenseList expenses={expenses} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
