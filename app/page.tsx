"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, XAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { AIInput } from "@/components/ai/AIInput";
import { ChatMessage } from "@/components/ai/ChatMessage";
import { RotateCcw, LogOut, User } from 'lucide-react';

const PIE_COLORS = ['#fafafa', '#d4d4d8', '#a1a1aa', '#71717a', '#52525b', '#3f3f46'];

interface DashboardStats {
    week: { category: string; total: string }[];
    month: { category: string; total: string }[];
    daily: { day: string; total: string }[];
    salary: number;
}

interface ExpenseEntry {
    id: number;
    amount: string;
    description: string;
    category_name: string;
    created_at: string;
}

interface UserSession {
    userId: string;
    isLoggedIn: boolean;
}

interface ChatMessageObj {
    role: 'user' | 'assistant';
    content: string;
}

export default function HomePage() {
    const [stats, setStats] = useState<DashboardStats>({ week: [], month: [], daily: [], salary: 0 });
    const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
    const [messages, setMessages] = useState<ChatMessageObj[]>([
        { role: 'assistant', content: 'Hello! I am your Kharch AI. Just type your expense or ask me a question like "How much did I spend this week?"' },
    ]);
    const [user, setUser] = useState<UserSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const fetchData = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch('/api/dashboard');
            const data = await res.json();
            
            if (data.stats) setStats(data.stats);
            if (data.expenses) setExpenses(data.expenses);
            if (data.user) setUser(data.user);
        } catch (e) {
            console.error("Dashboard Fetch Error:", e);
        } finally {
            setLoading(false);
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (content: string) => {
        setMessages(prev => [...prev, { role: 'user', content }]);
        try {
            const res = await fetch('/api/ai/extract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: content }),
            });
            const result = await res.json();
            if (result.success) {
                let reply = '';
                if (result.type === 'unsupported') {
                    reply = result.message || "I'm not sure how to handle that. Try recording an expense!";
                } else if (result.type === 'salary_update') {
                    reply = result.message;
                } else if (result.type === 'query') {
                    reply = result.message;
                } else if (result.type === 'expense') {
                    reply = result.message || `Recorded ₹${result.expense.amount} for ${result.expense.category}.`;
                } else {
                    reply = result.message || "Processed successfully.";
                }
                setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
                if (result.type !== 'unsupported') fetchData();
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: "I couldn't process that. Try again?" }]);
            }
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Connection lost. Please try again.' }]);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.reload();
    };

    const totalSpent = (stats.month || []).reduce((a: number, c: any) => a + parseFloat(c.total || 0), 0);
    const weekSpent = (stats.week || []).reduce((a: number, c: any) => a + parseFloat(c.total || 0), 0);
    const salary = stats.salary ?? 0;
    const burnRate = salary > 0 ? (totalSpent / salary) * 100 : 0;

    const pieData = (stats.month || []).map((s: any) => ({ name: s.category, value: parseFloat(s.total) }));
    const lineData = (stats.daily ?? []).map((s: any) => ({ date: s.day, amount: parseFloat(s.total) }));

    return (
        <div className="relative min-h-screen max-h-screen bg-zinc-950 text-zinc-50 overflow-hidden font-instrument selection:bg-white selection:text-black">
            <div
                className="absolute inset-0 z-0 bg-[url('/home.jpg')] bg-center bg-cover bg-no-repeat rounded-4xl"
                style={{ filter: 'brightness(0.3)' }}
            />

            <div className="absolute top-3 right-20 z-50 flex items-center gap-6">
                {user && (
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-xs font-bold text-zinc-100">{user.userId}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-md">
                            <User size={18} className="text-zinc-400" />
                        </div>
                    </div>
                )}
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 group px-4 py-2 rounded-xl hover:bg-white/5 transition-all text-zinc-500 hover:text-red-400"
                >
                    <span className="text-[10px] font-bold uppercase tracking-widest">Log Out</span>
                    <LogOut size={14} className="transition-transform group-hover:translate-x-1" />
                </button>
            </div>

            <div className='bg-linear-to-b from-[#D9D9D9]/40 to-[#737373]/10 absolute inset-x-20 inset-y-10 mt-5 flex rounded-2xl'>
                
                {/* ── LEFT COLUMN ───────────────────────────────────── */}
                <div className="h-full w-1/3 border-r border-white/10 flex flex-col items-center">
                    <div className="w-full flex justify-between items-center px-8 mt-4">
                        <h2 className="font-serif tracking-tight text-3xl text-white">Your Capital</h2>
                        <div className="font-serif text-2xl text-zinc-400 tabular-nums">
                            ₹{salary.toLocaleString()}
                        </div>
                    </div>

                    <div className="w-full space-y-4 px-8 mt-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Monthly Spend</p>
                            <p className="font-serif text-2xl text-zinc-100 tabular-nums">
                                ₹{totalSpent.toLocaleString()}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Weekly Spend</p>
                            <p className="font-serif text-2xl text-zinc-100 tabular-nums">
                                ₹{weekSpent.toLocaleString()}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Burn Rate</p>
                            <p className={`font-serif text-2xl tabular-nums ${burnRate > 80 ? 'text-red-400' : 'text-zinc-100'}`}>
                                {burnRate.toFixed(1)}%
                            </p>
                        </div>
                    </div>

                    <div className="w-full px-8 mt-10 pb-6 border-b border-white/5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-6">Spending Trend</p>
                        <div className="h-[100px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={lineData}>
                                    <Line 
                                        type="monotone" 
                                        dataKey="amount" 
                                        stroke="#ffffff" 
                                        strokeWidth={2} 
                                        dot={false}
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', fontSize: '10px' }}
                                        itemStyle={{ color: '#ffffff' }}
                                        labelStyle={{ display: 'none' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="w-full px-8 mt-10">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-6">Allocation</p>
                        <div className="flex items-center gap-4">
                            <div className="h-[100px] w-[100px] shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            innerRadius={30}
                                            outerRadius={45}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {pieData.map((_entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-1.5 overflow-hidden">
                                {pieData.slice(0, 5).map((item: any, i: number) => (
                                    <div key={item.name} className="flex items-center gap-2">
                                        <div className="h-1 w-1 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                                        <span className="text-[9px] font-bold uppercase tracking-tighter text-zinc-500 truncate">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── MIDDLE COLUMN (LEDGER) ─────────────────────────── */}
                <div className="h-full w-1/3 border-r border-white/10 flex flex-col">
                    <div className="px-8 mt-4 mb-6 flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                            <h2 className="font-serif tracking-tight text-3xl text-white">Ledger</h2>
                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">({expenses.length})</span>
                        </div>
                        <button 
                            onClick={fetchData}
                            className="p-1 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white"
                        >
                            <RotateCcw size={14} className={loading || isSyncing ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-8 space-y-6 pb-20 scrollbar-hide">
                        {expenses.length === 0 ? (
                            <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-600 mt-20 text-center">No transactions yet</p>
                        ) : (
                            expenses.map((expense) => (
                                <div key={expense.id} className="group border-b border-white/5 pb-4 transition-colors hover:border-white/10">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                                                {expense.created_at ? new Date(expense.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '---'}
                                            </p>
                                            <p className="text-sm font-bold text-zinc-100 group-hover:text-white transition-colors capitalize">
                                                {expense.description || expense.category_name || 'Unlabeled'}
                                            </p>
                                            {expense.description && (
                                                <span className="inline-block text-[8px] font-bold text-zinc-600 uppercase tracking-tighter">
                                                    {expense.category_name || 'General'}
                                                </span>
                                            )}
                                        </div>
                                        <p className="font-serif text-xl text-zinc-50 tabular-nums">
                                            ₹{(parseFloat(expense.amount) || 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* ── RIGHT COLUMN (ASSISTANT) ───────────────────────── */}
                <div className="h-full w-1/3 flex flex-col">
                    <div className="px-8 mt-4 mb-6 flex items-center justify-between">
                        <h2 className="font-serif tracking-tight text-3xl text-white">Assistant</h2>
                    </div>

                    <div
                        ref={chatContainerRef}
                        className="flex-1 overflow-y-auto px-8 space-y-2 pb-10 scrollbar-hide"
                    >
                        {messages.map((msg, i) => (
                            <ChatMessage key={i} {...msg} />
                        ))}
                    </div>

                    <div className="p-8 border-t border-white/5 bg-zinc-950/20 backdrop-blur-md">
                        <AIInput onSendMessage={handleSendMessage} />
                    </div>
                </div>
            </div>
        </div>
    );
}