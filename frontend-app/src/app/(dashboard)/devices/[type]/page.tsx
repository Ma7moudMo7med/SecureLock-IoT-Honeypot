'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  DoorOpen, 
  SquareAsterisk, 
  Lightbulb, 
  Camera, 
  ShieldCheck, 
  Thermometer,
  Search,
  Plus
} from 'lucide-react';
import api from '@/lib/api';
import { SmartDevice, StatusResponse } from '@/types';
import DeviceCard from '@/components/DeviceCard';

const typeInfo: Record<string, any> = {
  doors: { label: 'Doors', icon: DoorOpen, singular: 'door' },
  gates: { label: 'Gates', icon: SquareAsterisk, singular: 'gate' },
  lights: { label: 'Lights', icon: Lightbulb, singular: 'light' },
  cameras: { label: 'Cameras', icon: Camera, singular: 'camera' },
  sensors: { label: 'Sensors', icon: ShieldCheck, singular: 'sensor' },
  thermostats: { label: 'Thermostats', icon: Thermometer, singular: 'thermostat' },
};

export default function DevicesPage() {
  const { type } = useParams();
  const info = typeInfo[type as string] || { label: 'Devices', icon: ShieldCheck, singular: 'device' };
  
  const [devices, setDevices] = useState<SmartDevice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDevices = async () => {
    try {
      const res = await api.get('/api/device/status');
      const filtered = res.data.devices.filter((d: SmartDevice) => d.type === info.singular);
      setDevices(filtered);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [type]);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <info.icon className="w-6 h-6" />
             </div>
             <h2 className="text-2xl font-bold">{info.label}</h2>
          </div>
          <p className="text-text-dim text-sm pl-11">Manage and monitor your {info.label.toLowerCase()} in real-time.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          <span>Add Device</span>
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
          <input 
            type="text" 
            placeholder={`Search ${info.label.toLowerCase()}...`} 
            className="w-full bg-transparent border-none outline-none text-sm pl-12 pr-4 placeholder:text-text-dim/50"
          />
        </div>
        <div className="w-px h-8 bg-white/10"></div>
        <div className="flex items-center gap-2">
           <span className="text-xs font-bold text-text-dim">Sort by:</span>
           <select className="bg-transparent border-none outline-none text-xs font-bold text-white cursor-pointer">
              <option>Status</option>
              <option>Name</option>
              <option>Battery</option>
           </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
      ) : devices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {devices.map((device) => (
            <DeviceCard key={device.id} device={device} onUpdate={fetchDevices} />
          ))}
        </div>
      ) : (
        <div className="glass p-20 rounded-3xl border border-card-border flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-6 rounded-full bg-white/5 text-text-dim/30">
            <info.icon className="w-16 h-16" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold">No {info.label} Found</h3>
            <p className="text-text-dim text-sm max-w-xs">We couldn't find any devices of this type connected to your system.</p>
          </div>
          <button className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all">
             Refresh Discovery
          </button>
        </div>
      )}
    </div>
  );
}
