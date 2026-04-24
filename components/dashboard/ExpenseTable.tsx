"use client";

import React from 'react';
import { MoreHorizontal } from 'lucide-react';

interface ExpenseTableProps {
  expenses: any[];
}

export function ExpenseTable({ expenses }: ExpenseTableProps) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-3xl font-serif text-zinc-900 dark:text-zinc-100">Ledger</h3>
        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
          {expenses.length} {expenses.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      <table className="w-full text-left border-collapse">
        {/* Column headers */}
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800">
            {['Date', 'Description', 'Category', 'Amount', ''].map((h) => (
              <th
                key={h}
                className={`pb-4 px-0 pr-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest ${h === 'Amount' ? 'text-right pr-0' : ''}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        {/* Rows */}
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {expenses.length === 0 && (
            <tr>
              <td colSpan={5} className="py-16 text-center text-sm text-zinc-400">
                No entries yet. Tell the assistant your first expense.
              </td>
            </tr>
          )}
          {expenses.map((expense) => (
            <tr
              key={expense.id}
              className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
            >
              <td className="py-4 pr-6 text-[10px] text-zinc-400 font-bold uppercase tracking-widest whitespace-nowrap">
                {new Date(expense.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </td>
              <td className="py-4 pr-6 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {expense.description || 'Unlabeled'}
              </td>
              <td className="py-4 pr-6">
                {/* Badge: white bg + border-zinc-200 in light; dark-900 in dark */}
                <span className="inline-block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                  {expense.category_name}
                </span>
              </td>
              <td className="py-4 text-right text-xl font-serif text-zinc-900 dark:text-zinc-50 tabular-nums">
                ₹{parseFloat(expense.amount).toLocaleString()}
              </td>
              <td className="py-4 pl-4 text-right">
                <button className="p-1.5 rounded-md text-zinc-200 dark:text-zinc-700 hover:text-zinc-500 dark:hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-all">
                  <MoreHorizontal size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
