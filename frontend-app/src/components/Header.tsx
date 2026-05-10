'use client';

import React from 'react';
import { Bell, Search, Globe, ChevronDown, User as UserIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Header() {
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <header className="h-20 glass border-b border-card-border flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2 text-text-dim">
          <ChevronDown className="w-6 h-6 rotate-90" />
        </button>
        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
          <Search className="w-4 h-4 text-text-dim" />
          <input 
            type="text" 
            placeholder="Search devices, logs..." 
            className="bg-transparent border-none outline-none text-sm w-64 placeholder:text-text-dim/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
          <Globe className="w-4 h-4 text-text-dim" />
          <span className="text-xs font-medium">English</span>
          <ChevronDown className="w-3 h-3 text-text-dim" />
        </div>

        <div className="relative">
          <button className="p-2.5 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors relative">
            <Bell className="w-5 h-5 text-text-dim" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-bg-dark"></span>
          </button>
        </div>

        <div className="flex items-center gap-4 pl-6 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold">{user?.username || 'Admin'}</p>
            <p className="text-[10px] text-text-dim uppercase tracking-wider">{user?.role || 'Administrator'}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-hover p-0.5">
            <div className="w-full h-full bg-card-dark rounded-[10px] flex items-center justify-center overflow-hidden">
               <UserIcon className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
