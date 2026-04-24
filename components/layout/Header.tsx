import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6 dark:bg-black">
      <div className="flex w-full max-w-md items-center gap-2">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <Input 
            placeholder="Search expenses..." 
            className="pl-10 bg-zinc-50 border-none focus-visible:ring-1 dark:bg-zinc-900" 
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative text-zinc-500">
          <Bell size={20} />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-black"></span>
        </Button>
        <Avatar className="h-8 w-8">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>KA</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
