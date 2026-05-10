'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  RefreshCcw, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Info,
  ShieldAlert
} from 'lucide-react';
import api from '@/lib/api';
import { ActivityEntry } from '@/types';

export default function LogsPage() {
  const [logs, setLogs] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/logs');
      setLogs(res.data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.sourceIp.includes(searchTerm)
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Access Logs</h2>
          <p className="text-text-dim text-sm">Detailed history of all device interactions and system events.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchLogs}
            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-text-dim hover:text-white transition-all"
          >
            <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all">
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl border border-card-border overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-card-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
              <input 
                type="text" 
                placeholder="Filter by device, user, or action..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 outline-none focus:border-primary/50 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all">
              <Filter className="w-4 h-4 text-text-dim" />
              <span>Filters</span>
            </button>
          </div>
          <div className="text-[11px] text-text-dim font-medium uppercase tracking-widest">
            Showing {filteredLogs.length} entries
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-card-border">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-dim">Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-dim">Device</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-dim">Action</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-dim">Actor</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-dim">Source IP</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-dim">Severity</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-dim"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-xs font-medium text-white">{new Date(log.timestamp).toLocaleDateString()}</p>
                    <p className="text-[10px] text-text-dim">{new Date(log.timestamp).toLocaleTimeString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-white">{log.deviceName}</p>
                    <p className="text-[10px] text-text-dim">{log.deviceId}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-md ${
                        log.action.includes('locked') ? 'bg-success/10 text-success' : 
                        log.action.includes('unlocked') ? 'bg-error/10 text-error' : 
                        'bg-primary/10 text-primary'
                      }`}>
                        {log.action.includes('locked') ? <CheckCircle2 className="w-3 h-3" /> : <Info className="w-3 h-3" />}
                      </div>
                      <span className="text-xs font-medium">{log.action}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                        {log.actor.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-semibold">{log.actor}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-text-dim">
                    {log.sourceIp}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                      log.severity === 'error' ? 'bg-error/10 text-error border border-error/20' : 
                      log.severity === 'warn' ? 'bg-warning/10 text-warning border border-warning/20' : 
                      'bg-primary/10 text-primary border border-primary/20'
                    }`}>
                      {log.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-text-dim hover:text-white transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-text-dim text-sm">
                    No logs found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-card-border flex items-center justify-between">
          <p className="text-[11px] text-text-dim">Showing 1 to {filteredLogs.length} of {filteredLogs.length} entries</p>
          <div className="flex items-center gap-2">
            <button className="p-2 bg-white/5 border border-white/5 rounded-lg text-text-dim disabled:opacity-30" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-lg text-[11px] font-bold">1</button>
            <button className="p-2 bg-white/5 border border-white/5 rounded-lg text-text-dim disabled:opacity-30" disabled>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
