"use client";

import React, { useState, useEffect } from 'react';
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { ChartSection } from "@/components/dashboard/ChartSection";
import { ExpenseList } from "@/components/dashboard/ExpenseList";
import { AIInput } from "@/components/ai/AIInput";
import { ChatMessage } from "@/components/ai/ChatMessage";
import { CreditCard, Wallet, TrendingUp, Calendar } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  data?: any;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'Hello! I am your Kharch AI. How can I help you track your expenses today?' 
    }
  ]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ week: [], month: [] });
  const [loading, setLoading] = useState(true);

  // We'll use a default userId for the demo if no session exists.
  // The API will check for the session cookie first.
  const defaultUserId = 1; 

  const fetchData = async () => {
    try {
      const [expensesRes, statsRes] = await Promise.all([
        fetch(`/api/expenses?userId=${defaultUserId}`),
        fetch(`/api/stats?userId=${defaultUserId}`)
      ]);
      
      const expensesData = await expensesRes.json();
      const statsData = await statsRes.json();
      
      if (Array.isArray(expensesData)) setExpenses(expensesData);
      if (statsData.week && statsData.month) setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        const assistantMsg: Message = {
          role: 'assistant',
          content: `✅ Recorded ₹${result.expense.amount} in ${result.expense.category}.`,
          data: result.expense
        };
        setMessages(prev => [...prev, assistantMsg]);
        fetchData(); // Refresh dashboard data
      } else {
        throw new Error(result.error || "Failed to parse");
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I couldn't process that expense. Please make sure you're logged in or try again." 
      }]);
    }
  };

  // Aggregations
  const totalSpent = stats.month.reduce((acc: number, curr: any) => acc + parseFloat(curr.total), 0);
  const weekSpent = stats.week.reduce((acc: number, curr: any) => acc + parseFloat(curr.total), 0);
  const topCategory = stats.month.length > 0 ? stats.month[0].category : "N/A";

  // Data Formatting for Charts
  const pieData = stats.month.map((s: any) => ({ 
    name: s.category, 
    value: parseFloat(s.total) 
  }));
  
  const lineData = stats.week.map((s: any) => ({
    date: s.category.substring(0, 3), // Placeholder mapping
    amount: parseFloat(s.total)
  }));

  return (
    <div className="flex h-screen bg-zinc-50 font-sans dark:bg-black overflow-hidden">
      <Sidebar />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 relative">
          <div className="mx-auto max-w-6xl space-y-8">
            
            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryCard 
                title="Total Month Spend" 
                value={`₹${totalSpent.toLocaleString()}`} 
                icon={Wallet} 
                trendType="neutral"
                color="bg-blue-50 text-blue-600"
              />
              <SummaryCard 
                title="Past 7 Days" 
                value={`₹${weekSpent.toLocaleString()}`} 
                icon={Calendar} 
                trendType="neutral"
                color="bg-purple-50 text-purple-600"
              />
              <SummaryCard 
                title="Top Category" 
                value={topCategory} 
                icon={CreditCard} 
                color="bg-orange-50 text-orange-600"
              />
              <SummaryCard 
                title="Transactions" 
                value={expenses.length.toString()} 
                icon={TrendingUp} 
                color="bg-green-50 text-green-600"
              />
            </div>

            {/* Charts */}
            <ChartSection lineData={lineData} pieData={pieData} />

            {/* Content Bottom */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-32">
              <div className="lg:col-span-2">
                <ExpenseList expenses={expenses} />
              </div>
              
              {/* AI Assistant History Panel */}
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-medium text-zinc-500 px-1">AI Assistant</h3>
                <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                  {messages.map((msg, i) => (
                    <ChatMessage 
                      key={i} 
                      role={msg.role} 
                      content={msg.content} 
                      data={msg.data} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI Input Bar */}
          <AIInput onSendMessage={handleSendMessage} />
        </main>
      </div>
    </div>
  );
}
