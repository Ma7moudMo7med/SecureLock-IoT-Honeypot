'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  DoorOpen, 
  SquareAsterisk, 
  Lightbulb, 
  Camera, 
  Thermometer, 
  Settings, 
  FileText, 
  Users, 
  ShieldCheck, 
  History,
  Info,
  HelpCircle,
  LayoutGrid,
  Zap,
  Activity,
  Menu,
  X
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { label: 'Home', icon: Home, href: '/dashboard', group: 'MAIN' },
  { label: 'Doors', icon: DoorOpen, href: '/devices/doors', group: 'DEVICES' },
  { label: 'Gates', icon: SquareAsterisk, href: '/devices/gates', group: 'DEVICES' },
  { label: 'Lights', icon: Lightbulb, href: '/devices/lights', group: 'DEVICES' },
  { label: 'Cameras', icon: Camera, href: '/devices/cameras', group: 'DEVICES' },
  { label: 'Sensors', icon: ShieldCheck, href: '/devices/sensors', group: 'DEVICES' },
  { label: 'Themostats', icon: Thermometer, href: '/devices/thermostats', group: 'DEVICES' },
  { label: 'Schedules', icon: History, href: '/automation/schedules', group: 'AUTOMATION' },
  { label: 'Rules', icon: Zap, href: '/automation/rules', group: 'AUTOMATION' },
  { label: 'Users', icon: Users, href: '/system/users', group: 'SYSTEM' },
  { label: 'Settings', icon: Settings, href: '/settings', group: 'SYSTEM' },
  { label: 'Logs', icon: FileText, href: '/logs', group: 'SYSTEM' },
  { label: 'Debug', icon: Activity, href: '/debug', group: 'SYSTEM' },
];

export default function Sidebar() {
  const pathname = usePathname();

  const groupedItems = navItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof navItems>);

  return (
    <aside className="w-64 h-screen glass border-r border-card-border flex flex-col fixed left-0 top-0 z-50 overflow-y-auto">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <ShieldCheck className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight uppercase tracking-wider">Smart Luck</h1>
          <p className="text-[10px] text-text-dim uppercase tracking-[0.2em]">Controller</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-6">
        {Object.entries(groupedItems).map(([group, items]) => (
          <div key={group} className="space-y-1">
            <h3 className="px-4 text-[10px] font-semibold text-text-dim/50 uppercase tracking-widest mb-2">
              {group}
            </h3>
            {items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group",
                    isActive 
                      ? "bg-active-gradient text-white" 
                      : "text-text-dim hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-primary" : "text-text-dim group-hover:text-white"
                  )} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/20">
              <HelpCircle className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs font-semibold">Need Help?</span>
          </div>
          <p className="text-[10px] text-text-dim leading-relaxed">
            Contact support or check documentation for assistance.
          </p>
          <button className="w-full py-2 text-[10px] font-bold uppercase tracking-wider bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors">
            Contact Support
          </button>
        </div>
        <div className="mt-4 flex flex-col gap-1 px-2">
            <p className="text-[9px] text-text-dim/50">© 2024 Smart Luck Controller. All rights reserved.</p>
            <p className="text-[9px] text-text-dim/50">Version 2.4.1</p>
        </div>
      </div>
    </aside>
  );
}
