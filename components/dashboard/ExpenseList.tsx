import { ShoppingBag, Coffee, Car, Home, MoreHorizontal, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ExpenseListProps {
  expenses: any[];
}

const getCategoryIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('food')) return { icon: Coffee, color: 'bg-orange-50 text-orange-600' };
  if (n.includes('travel') || n.includes('transport')) return { icon: Car, color: 'bg-purple-50 text-purple-600' };
  if (n.includes('shop')) return { icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' };
  if (n.includes('house') || n.includes('rent')) return { icon: Home, color: 'bg-green-50 text-green-600' };
  return { icon: Receipt, color: 'bg-zinc-50 text-zinc-600' };
};

export function ExpenseList({ expenses }: ExpenseListProps) {
  return (
    <Card className="border-none shadow-sm dark:bg-zinc-900">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium text-zinc-500">Recent Transactions</CardTitle>
        <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700">View All</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {expenses.length === 0 && (
            <p className="text-sm text-center py-8 text-zinc-500">No expenses found.</p>
          )}
          {expenses.map((expense) => {
            const { icon: Icon, color } = getCategoryIcon(expense.category_name || "");
            return (
              <div key={expense.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color} dark:bg-opacity-10`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{expense.description || "No description"}</p>
                    <p className="text-xs text-zinc-500">{expense.category_name} • {new Date(expense.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">₹{expense.amount}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal size={14} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

