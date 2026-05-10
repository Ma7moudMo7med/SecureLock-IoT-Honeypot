'use client';

import React, { useState } from 'react';
import { 
  Zap, 
  Cpu, 
  RefreshCcw, 
  ShieldCheck, 
  AlertTriangle, 
  Globe, 
  CheckCircle2,
  ArrowUpCircle,
  History,
  Download
} from 'lucide-react';
import api from '@/lib/api';

export default function FirmwarePage() {
  const [currentInfo, setCurrentInfo] = useState<any>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);

  const fetchFirmwareInfo = async () => {
    try {
      const res = await api.get('/api/firmware/info');
      setCurrentInfo(res.data);
      setVersion(res.data.latestVersion);
    } catch (error) {
      console.error('Failed to fetch firmware info:', error);
    } finally {
      setLoadingInfo(false);
    }
  };

  useEffect(() => {
    fetchFirmwareInfo();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setProgress(0);
    setMessage(null);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 400);

    try {
      const res = await api.post('/api/firmware/update', { version, url, forceInstall: force });
      setTimeout(() => {
        setMessage(res.data.message || 'Firmware update scheduled successfully!');
        setUpdating(false);
        setProgress(100);
      }, 4000);
    } catch (error: any) {
      setMessage(`Update failed: ${error.response?.data?.message || error.message}`);
      setUpdating(false);
      clearInterval(interval);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 pb-20">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">Firmware Update</h2>
        <p className="text-text-dim text-sm">Keep your devices up to date with the latest security patches and features.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Current Status */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass p-8 rounded-2xl border border-card-border flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Cpu className="w-10 h-10 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-dim uppercase tracking-[0.2em]">Current Version</p>
              <p className="text-3xl font-bold mt-1">v{currentInfo?.currentVersion || '2.4.1'}</p>
            </div>
            {currentInfo?.updateAvailable ? (
              <div className="flex items-center gap-2 px-4 py-1.5 bg-warning/10 text-warning border border-warning/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5" />
                Update Available
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-1.5 bg-success/10 text-success border border-success/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Up to date
              </div>
            )}
            <div className="w-full h-px bg-white/5 my-4"></div>
            <div className="w-full grid grid-cols-2 gap-4">
              <div className="text-left">
                <p className="text-[9px] text-text-dim font-bold uppercase tracking-wider">Last Check</p>
                <p className="text-xs font-semibold">2 hours ago</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-text-dim font-bold uppercase tracking-wider">Build ID</p>
                <p className="text-xs font-semibold">#7F92E</p>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl border border-card-border space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              Update History
            </h3>
            <div className="space-y-3">
              {[
                { v: 'v2.4.0', d: 'May 01, 2024', s: 'Success' },
                { v: 'v2.3.8', d: 'Apr 12, 2024', s: 'Success' },
              ].map((h, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div>
                    <p className="text-xs font-bold">{h.v}</p>
                    <p className="text-[10px] text-text-dim">{h.d}</p>
                  </div>
                  <span className="text-[9px] font-bold uppercase text-success">{h.s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Update Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass p-8 rounded-2xl border border-card-border space-y-8">
            <div className="flex items-center gap-3">
              <ArrowUpCircle className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-bold">Manual Update</h3>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim">New Version</label>
                <input 
                  type="text" 
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="e.g. 2.4.2"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-primary/50 text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Update URL (Remote Package)</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                  <input 
                    type="url" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-primary/50 text-sm"
                    required
                  />
                </div>
                <p className="text-[10px] text-text-dim italic">Note: The system will pull the update package from this URL. Ensure it's reachable from the device network.</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl">
                 <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                    <div>
                      <p className="text-xs font-bold">Force Installation</p>
                      <p className="text-[10px] text-text-dim">Skip signature validation and integrity checks.</p>
                    </div>
                 </div>
                 <button 
                  type="button"
                  onClick={() => setForce(!force)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${force ? 'bg-warning' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${force ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>

              {updating && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                    <span className="text-text-dim">Downloading Update Package...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              )}

              {message && (
                <div className={`p-4 rounded-xl flex gap-3 animate-fade-in ${message.includes('Success') ? 'bg-success/10 border border-success/20 text-success' : 'bg-error/10 border border-error/20 text-error'}`}>
                   {message.includes('Success') ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
                   <p className="text-xs font-bold leading-tight">{message}</p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={updating}
                className="w-full bg-primary hover:bg-primary-hover py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {updating ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                <span>Initiate Update</span>
              </button>
            </form>
          </div>

          <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex gap-4">
             <ShieldCheck className="w-6 h-6 text-primary shrink-0" />
             <div>
                <p className="text-xs font-bold">Secure Boot Enabled</p>
                <p className="text-[11px] text-text-dim leading-relaxed">
                  All updates are normally verified by the system's root of trust. Using 'Force Installation' bypasses these checks and should only be used for debugging or emergency recovery.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
