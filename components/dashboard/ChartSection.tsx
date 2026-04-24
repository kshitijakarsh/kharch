"use client";

import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartSectionProps {
  lineData: any[];
  pieData: any[];
}

const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#10b981', '#f59e0b'];

export function ChartSection({ lineData, pieData }: ChartSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 border-none shadow-sm dark:bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-base font-medium text-zinc-500">Spending Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[240px] w-full">
            {lineData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-400 text-sm">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#888' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#888' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)' 
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#2563eb" 
                    strokeWidth={2} 
                    dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm dark:bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-base font-medium text-zinc-500">Allocation</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="h-[200px] w-full">
            {pieData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-400 text-sm">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2">
            {pieData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-xs text-zinc-600 dark:text-zinc-400">{item.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

