"use client";

import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartSectionProps {
  lineData: any[];
  pieData: any[];
}

/* Dark palette — always applied */
const PIE_COLORS = ['#fafafa', '#d4d4d8', '#a1a1aa', '#71717a', '#52525b', '#3f3f46'];

const CHART = {
  stroke:       '#fafafa',
  grid:         '#27272a',
  tick:         '#71717a',
  tooltipBg:    '#09090b',
  tooltipBorder:'#27272a',
  tooltipColor: '#fafafa',
  dotStroke:    '#09090b',
};

export function ChartSection({ lineData, pieData }: ChartSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

      {/* ── Monthly Spending Line Chart ────────────────────── */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-sans">
            Monthly Spending
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-[300px] w-full overflow-hidden">
            {lineData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-700 text-xs uppercase tracking-widest">
                No data for this month
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="0" vertical={false} stroke={CHART.grid} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: CHART.tick, fontWeight: 600 }}
                    dy={15}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: CHART.tick, fontWeight: 600 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: `1px solid ${CHART.tooltipBorder}`,
                      boxShadow: 'none',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      backgroundColor: CHART.tooltipBg,
                      color: CHART.tooltipColor,
                    }}
                    itemStyle={{ color: CHART.tooltipColor }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke={CHART.stroke}
                    strokeWidth={2}
                    dot={{ r: 4, fill: CHART.stroke, strokeWidth: 2, stroke: CHART.dotStroke }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Allocation Pie Chart ───────────────────────────── */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-sans">
            Allocation
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="relative h-[240px] w-full overflow-hidden">
            {pieData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-700 text-xs uppercase tracking-widest">
                No data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: `1px solid ${CHART.tooltipBorder}`,
                      boxShadow: 'none',
                      fontSize: '11px',
                      backgroundColor: CHART.tooltipBg,
                      color: CHART.tooltipColor,
                    }}
                    itemStyle={{ color: CHART.tooltipColor }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Legend */}
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 w-full">
            {pieData.slice(0, 6).map((item, i) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight truncate">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
