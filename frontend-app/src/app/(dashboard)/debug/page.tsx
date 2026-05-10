'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Terminal, 
  Server, 
  Cpu, 
  Globe, 
  Code, 
  Play, 
  Trash2, 
  ShieldAlert,
  Search,
  Database,
  Network
} from 'lucide-react';
import api from '@/lib/api';
import { DebugSystemResponse } from '@/types';

export default function DebugPage() {
  const [debugData, setDebugData] = useState<DebugSystemResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [command, setCommand] = useState('uname -a');
  const [commandOutput, setCommandOutput] = useState('');
  const [executing, setExecuting] = useState(false);

  const fetchDebugInfo = async () => {
    try {
      const res = await api.get('/api/debug/system');
      setDebugData(res.data);
    } catch (error) {
      console.error('Failed to fetch debug info:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebugInfo();
  }, []);

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;
    
    setExecuting(true);
    try {
      // POST /api/debug/exec expects the command in the body or query
      const res = await api.post('/api/debug/exec', { cmd: command });
      
      // Backend returns { command, output, warning, simulated, ... }
      const output = res.data.output || 'Command executed (no output).';
      setCommandOutput(output);
      
      // If it was a multi-line output, ensure we keep it readable
      console.log('Command Result:', res.data);
    } catch (error: any) {
      setCommandOutput(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setExecuting(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-3 p-4 bg-error/10 border border-error/20 rounded-2xl">
        <ShieldAlert className="w-6 h-6 text-error shrink-0" />
        <div>
          <p className="text-xs font-bold text-error uppercase tracking-wider">Restricted Debug Interface</p>
          <p className="text-[11px] text-error/80">This page is for internal engineering use only. Authorized personnel only.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* System Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass p-6 rounded-2xl border border-card-border space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              System Info
            </h3>
            
            <div className="space-y-4">
              {[
                { label: 'Firmware', value: debugData?.firmwareVersion, icon: Code },
                { label: 'OS', value: debugData?.operatingSystem, icon: Globe },
                { label: 'Kernel', value: debugData?.kernelVersion, icon: Cpu },
                { label: 'Hostname', value: debugData?.hostname, icon: Network },
                { label: 'Uptime', value: debugData?.uptime, icon: Activity },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-white/5 text-text-dim">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest">{item.label}</p>
                    <p className="text-xs font-mono truncate text-white">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass p-6 rounded-2xl border border-card-border space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Database className="w-4 h-4 text-success" />
              Active Services
            </h3>
            <div className="space-y-2">
              {debugData?.services.map((svc, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-[11px] font-mono">{svc}</span>
                  <span className="w-2 h-2 rounded-full bg-success"></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Terminal / Shell */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass rounded-2xl border border-card-border overflow-hidden flex flex-col h-[600px]">
            <div className="bg-white/5 p-4 border-b border-card-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-bold">System Console</h3>
              </div>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-error/50"></div>
                <div className="w-3 h-3 rounded-full bg-warning/50"></div>
                <div className="w-3 h-3 rounded-full bg-success/50"></div>
              </div>
            </div>

            <div className="flex-1 bg-black/40 p-6 font-mono text-xs overflow-y-auto space-y-4 scroll-smooth">
              <div className="space-y-1">
                <p className="text-primary"># SmartLuck Embedded Terminal v1.0.4</p>
                <p className="text-text-dim">Connected to local system as 'root'. Warning: Commands are executed with elevated privileges.</p>
              </div>

              {commandOutput && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 animate-fade-in">
                  <pre className="whitespace-pre-wrap text-success/90">{commandOutput}</pre>
                </div>
              )}
              
              {!commandOutput && !executing && (
                <div className="flex flex-col items-center justify-center h-full text-text-dim/30 space-y-2">
                  <Terminal className="w-12 h-12" />
                  <p className="uppercase tracking-[0.2em] font-bold">Waiting for input</p>
                </div>
              )}

              {executing && (
                <div className="flex items-center gap-3 text-primary animate-pulse">
                  <span>Executing...</span>
                </div>
              )}
            </div>

            <div className="p-4 bg-white/5 border-t border-card-border">
              <form onSubmit={handleExecute} className="flex gap-3">
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">#</span>
                  <input 
                    type="text" 
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    placeholder="Enter system command..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-8 pr-4 outline-none focus:border-primary/50 font-mono text-xs"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={executing}
                  className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {executing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Play className="w-4 h-4" />}
                </button>
              </form>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl border border-card-border">
             <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                <Code className="w-4 h-4 text-primary" />
                Environment Variables
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {debugData && Object.entries(debugData.environment).map(([key, val]) => (
                  <div key={key} className="flex flex-col gap-1 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                    <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider">{key}</span>
                    <span className="text-xs font-mono break-all">{val}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
