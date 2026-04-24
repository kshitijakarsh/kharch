import { ShoppingBag, Coffee, Car, Home, Receipt } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ExpenseListProps {
  expenses: any[];
}

/* Category → icon + colour pill.
   Light mode: pastel tint on white — no grey fills.
   Dark mode:  low-opacity colour fill on zinc-900 surface. */
const getCategoryIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('food') || n.includes('coffee') || n.includes('restaurant'))
    return { icon: Coffee,      color: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400' };
  if (n.includes('travel') || n.includes('transport') || n.includes('petrol'))
    return { icon: Car,         color: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' };
  if (n.includes('shop') || n.includes('shopping'))
    return { icon: ShoppingBag, color: 'bg-sky-50    dark:bg-sky-500/10    text-sky-600    dark:text-sky-400'    };
  if (n.includes('house') || n.includes('rent') || n.includes('home'))
    return { icon: Home,        color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' };
  /* fallback — white bg with a border in light; zinc-800 in dark */
  return   { icon: Receipt,     color: 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400' };
};

export function ExpenseList({ expenses }: ExpenseListProps) {
  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Recent Transactions
        </span>
        <button className="text-[10px] uppercase tracking-widest font-bold text-zinc-900 dark:text-zinc-100 hover:text-zinc-400 dark:hover:text-zinc-500 transition-colors">
          View History
        </button>
      </div>

      {/* List */}
      <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
        {expenses.length === 0 && (
          /* Empty state — white bg, dashed border, no fill */
          <div className="text-center py-20 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <Receipt className="mx-auto text-zinc-200 dark:text-zinc-700 mb-4" size={36} />
            <p className="text-sm text-zinc-400 font-medium">No activity recorded yet.</p>
            <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-1 uppercase tracking-widest">
              Tell the assistant your first expense
            </p>
          </div>
        )}

        {expenses.map((expense) => {
          const { icon: Icon, color } = getCategoryIcon(expense.category_name ?? '');
          const date = new Date(expense.created_at).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric',
          });

          return (
            <div
              key={expense.id}
              className="group flex items-center justify-between py-5 transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* Icon pill */}
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl shrink-0 transition-transform group-hover:scale-105',
                  color,
                )}>
                  <Icon size={18} />
                </div>

                {/* Meta */}
                <div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                    {expense.description || 'Unlabeled Expense'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      {expense.category_name}
                    </span>
                    <span className="h-0.5 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                    <span className="text-[10px] text-zinc-400 uppercase tracking-widest">
                      {date}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amount */}
              <span className="text-xl font-serif text-zinc-900 dark:text-zinc-50 tabular-nums">
                ₹{parseFloat(expense.amount).toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}