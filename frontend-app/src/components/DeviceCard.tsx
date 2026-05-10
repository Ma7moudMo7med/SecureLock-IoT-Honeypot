'use client';

import React from 'react';
import Image from 'next/image';
import { Lock, Unlock, Clock, MoreVertical, Power, PowerOff } from 'lucide-react';
import { SmartDevice } from '@/types';
import api from '@/lib/api';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DeviceCardProps {
  device: SmartDevice;
  onUpdate: () => void;
}

export default function DeviceCard({ device, onUpdate }: DeviceCardProps) {
  const [loading, setLoading] = React.useState(false);

  const isLight = device.type === 'light';
  const isGate = device.type === 'gate';
  
  // Status mapping
  const isOn = device.status === 'on' || device.status === 'unlocked' || device.status === 'open';
  const isOff = device.status === 'off' || device.status === 'locked' || device.status === 'closed';

  const toggleStatus = async (actionType: 'on' | 'off') => {
    setLoading(true);
    try {
      // Backend expects 'lock' or 'unlock' regardless of device type for now
      // lock -> off/closed/locked
      // unlock -> on/open/unlocked
      const apiAction = actionType === 'on' ? 'unlock' : 'lock';
      await api.post(`/api/device/${apiAction}`, { deviceId: device.id });
      onUpdate();
    } catch (error) {
      console.error('Failed to toggle device:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-2xl border border-card-border overflow-hidden transition-all duration-300 hover:border-primary/30 group">
      <div className="p-5 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm">{device.name}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <div className={cn(
              "w-1.5 h-1.5 rounded-full",
              isOn ? "bg-success" : "bg-error"
            )}></div>
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-wider",
              isOn ? "text-success" : "text-error"
            )}>
              {device.status}
            </span>
          </div>
        </div>
        <button className="p-1.5 text-text-dim hover:text-white transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <div className="px-5 pb-2 relative h-40 group-hover:scale-105 transition-transform duration-500">
        <div className="relative w-full h-full rounded-xl overflow-hidden bg-bg-dark/50">
          <Image 
            src={device.image || (isLight ? '/light-bg.png' : '/door-main.png')} 
            alt={device.name} 
            fill 
            className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          />
        </div>
      </div>

      <div className="p-5 grid grid-cols-2 gap-3">
        {isLight ? (
          <>
            <button 
              onClick={() => !isOff && toggleStatus('off')}
              disabled={loading || isOff}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-bold transition-all",
                isOff 
                  ? "bg-primary text-white" 
                  : "bg-white/5 text-text-dim hover:bg-white/10"
              )}
            >
              <PowerOff className="w-3.5 h-3.5" />
              <span>Turn Off</span>
            </button>
            <button 
              onClick={() => !isOn && toggleStatus('on')}
              disabled={loading || isOn}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-bold transition-all",
                isOn 
                  ? "bg-primary text-white" 
                  : "bg-white/5 text-text-dim hover:bg-white/10"
              )}
            >
              <Power className="w-3.5 h-3.5" />
              <span>Turn On</span>
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => !isOff && toggleStatus('off')}
              disabled={loading || isOff}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-bold transition-all",
                isOff 
                  ? "bg-primary text-white" 
                  : "bg-white/5 text-text-dim hover:bg-white/10"
              )}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isGate ? 'Close' : 'Lock'}</span>
            </button>
            <button 
              onClick={() => !isOn && toggleStatus('on')}
              disabled={loading || isOn}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-bold transition-all",
                isOn 
                  ? "bg-primary text-white" 
                  : "bg-white/5 text-text-dim hover:bg-white/10"
              )}
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>{isGate ? 'Open' : 'Unlock'}</span>
            </button>
          </>
        )}
      </div>

      <div className="px-5 pb-5 flex items-center gap-1.5 text-text-dim/50">
        <Clock className="w-3 h-3" />
        <span className="text-[9px]">Last updated: 1 minute ago</span>
      </div>
    </div>
  );
}
