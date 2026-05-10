'use client';

import React, { useEffect, useState } from 'react';
import { 
  Sun, 
  Cloud, 
  DoorOpen, 
  SquareAsterisk, 
  Lightbulb, 
  ShieldCheck, 
  LayoutGrid, 
  List, 
  Lock, 
  Unlock,
  Settings,
  Bell,
  MoreVertical,
  Activity,
  History,
  ArrowRight
} from 'lucide-react';
import api from '@/lib/api';
import { SmartDevice, StatusResponse, ActivityEntry } from '@/types';
import DeviceCard from '@/components/DeviceCard';

export default function DashboardPage() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [statusRes, logsRes] = await Promise.all([
        api.get('/api/device/status'),
        api.get('/api/admin/logs?limit=4')
      ]);
      setStatus(statusRes.data);
      setActivities(logsRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLockAll = async () => {
    try {
      await api.post('/api/device/lock-all');
      fetchData();
    } catch (error) {
      console.error('Failed to lock all doors:', error);
    }
  };

  const handleQuickAction = async (action: string) => {
    try {
      if (action === 'Lock All Doors') {
        await api.post('/api/device/lock-all');
      } else if (action === 'Turn Off All Lights') {
        // Find all lights and turn them off
        const lights = status?.devices.filter(d => d.type === 'light') || [];
        await Promise.all(lights.map(l => api.post('/api/device/lock', { deviceId: l.id })));
      }
      fetchData();
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  if (loading && !status) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = [
    { label: 'Doors', value: status?.totalDoors || 0, sub: `${status?.openDoors || 0} Open`, icon: DoorOpen, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Gate', value: status?.totalGates || 0, sub: status?.openGates ? 'Open' : 'Closed', icon: SquareAsterisk, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Lights', value: status?.totalLights || 0, sub: `${status?.lightsOn || 0} On`, icon: Lightbulb, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'All Systems', value: status?.systemHealth || 'Secure', sub: 'No alerts', icon: ShieldCheck, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Welcome back, {user?.username || 'Admin'}</h2>
          <p className="text-text-dim text-sm">Here's what's happening in your home today.</p>
        </div>
        
        <div className="glass px-6 py-3 rounded-2xl border border-card-border flex items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-full bg-warning/10">
               <Sun className="w-5 h-5 text-warning" />
             </div>
             <div>
               <p className="text-sm font-bold">24°C</p>
               <p className="text-[10px] text-text-dim">Cairo, Egypt</p>
               <p className="text-[10px] text-text-dim">Sunny</p>
             </div>
          </div>
          <div className="w-px h-10 bg-white/5"></div>
          <div className="text-right">
            <p className="text-sm font-bold">Tuesday</p>
            <p className="text-[10px] text-text-dim">May 16, 2024</p>
            <p className="text-[10px] text-text-dim">10:30 AM</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass p-5 rounded-2xl border border-card-border flex items-center gap-5 group hover:border-primary/30 transition-all">
            <div className={`w-14 h-14 rounded-full ${stat.bg} flex items-center justify-center shrink-0`}>
              <stat.icon className={`w-7 h-7 ${stat.color}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{stat.value}</span>
                <span className="text-xs font-semibold text-text-dim">{stat.label}</span>
              </div>
              <p className="text-[11px] text-text-dim/70 mt-0.5">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Doors Control */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Doors Control</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white/5 p-1 rounded-lg border border-white/5">
              <button className="p-1.5 bg-primary text-white rounded-md">
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button className="p-1.5 text-text-dim hover:text-white transition-colors">
                <List className="w-4 h-4" />
              </button>
            </div>
            <button 
              onClick={handleLockAll}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary/20"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock All Doors</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {status?.devices.filter(d => d.type === 'door').map((device) => (
            <DeviceCard key={device.id} device={device} onUpdate={fetchData} />
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="glass p-6 rounded-2xl border border-card-border space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Recent Activity</h3>
            <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1 group">
              View All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="space-y-4">
            {activities.length > 0 ? activities.map((log) => (
              <div key={log.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    log.action.includes('locked') ? 'bg-success/10 text-success' : 
                    log.action.includes('unlocked') ? 'bg-error/10 text-error' : 
                    'bg-primary/10 text-primary'
                  }`}>
                    {log.action.includes('locked') ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{log.deviceName} {log.action}</p>
                    <div className="flex items-center gap-2 text-[10px] text-text-dim">
                      <span className="font-medium text-white/40">{log.actor}</span>
                      <span>•</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-text-dim group-hover:text-white transition-colors">
                  {log.sourceIp === '127.0.0.1' ? 'Local' : log.sourceIp}
                </div>
              </div>
            )) : (
              <p className="text-center text-text-dim py-8">No recent activity.</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass p-6 rounded-2xl border border-card-border space-y-6">
          <h3 className="text-lg font-bold">Quick Actions</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Lock All Doors', sub: 'Lock all doors in the house', icon: Lock, color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Open Main Gate', sub: 'Open the main gate', icon: SquareAsterisk, color: 'text-success', bg: 'bg-success/10' },
              { label: 'Turn Off All Lights', sub: 'Turn off all lights', icon: Lightbulb, color: 'text-warning', bg: 'bg-warning/10' },
              { label: 'Arm Security', sub: 'Activate security system', icon: ShieldCheck, color: 'text-blue-400', bg: 'bg-blue-400/10' },
            ].map((action, i) => (
              <button 
                key={i} 
                onClick={() => handleQuickAction(action.label)}
                className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 hover:bg-white/10 transition-all text-left group"
              >
                <div className={`p-3 rounded-xl ${action.bg} ${action.color} group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">{action.label}</p>
                  <p className="text-[10px] text-text-dim mt-0.5">{action.sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
