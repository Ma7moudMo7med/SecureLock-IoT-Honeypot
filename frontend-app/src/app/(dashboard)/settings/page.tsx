'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Bell, 
  Smartphone, 
  Zap, 
  Share2, 
  Database, 
  Code,
  Save,
  Moon,
  LogOut,
  Volume2,
  Activity,
  Trash2,
  Mail,
  User,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import api from '@/lib/api';
import { DeviceSettings } from '@/types';

const tabs = [
  { id: 'general', label: 'General', icon: SettingsIcon },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'devices', label: 'Devices', icon: Smartphone },
  { id: 'automation', label: 'Automation', icon: Zap },
  { id: 'integrations', label: 'Integrations', icon: Share2 },
  { id: 'backup', label: 'Backup & Restore', icon: Database },
  { id: 'advanced', label: 'Advanced', icon: Code },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<DeviceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/api/device/settings');
      setSettings(res.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setMessage(null);
    try {
      await api.post('/api/device/settings', settings);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof DeviceSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  if (loading) return <div className="flex justify-center p-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="max-w-6xl space-y-8 pb-20">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-text-dim text-sm">Manage your system preferences and configurations.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-primary text-white bg-primary/5' 
                : 'border-transparent text-text-dim hover:text-white hover:bg-white/5'
            }`}
          >
            {/* <tab.icon className="w-4 h-4" /> */}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-8">
          {/* General Settings */}
          <div className="glass p-8 rounded-2xl border border-card-border space-y-8">
            <h3 className="text-lg font-bold">General Settings</h3>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Home Name</label>
                <input 
                  type="text" 
                  value={settings?.homeName || ''} 
                  onChange={(e) => updateSetting('homeName', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-primary/50 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Time Zone</label>
                  <select 
                    value={settings?.timeZone || ''} 
                    onChange={(e) => updateSetting('timeZone', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-primary/50 text-sm appearance-none"
                  >
                    <option>(UTC+02:00) Cairo, Egypt</option>
                    <option>(UTC+00:00) London, UK</option>
                    <option>(UTC-05:00) New York, USA</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Date Format</label>
                  <select 
                    value={settings?.dateFormat || ''} 
                    onChange={(e) => updateSetting('dateFormat', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-primary/50 text-sm appearance-none"
                  >
                    <option>DD / MM / YYYY</option>
                    <option>MM / DD / YYYY</option>
                    <option>YYYY - MM - DD</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Time Format</label>
                  <select 
                    value={settings?.timeFormat || ''} 
                    onChange={(e) => updateSetting('timeFormat', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-primary/50 text-sm appearance-none"
                  >
                    <option>12 Hour (AM / PM)</option>
                    <option>24 Hour</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Temperature Unit</label>
                  <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    <button 
                      onClick={() => updateSetting('temperatureUnit', 'C')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${settings?.temperatureUnit === 'C' ? 'bg-primary text-white' : 'text-text-dim hover:text-white'}`}
                    >°C</button>
                    <button 
                      onClick={() => updateSetting('temperatureUnit', 'F')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${settings?.temperatureUnit === 'F' ? 'bg-primary text-white' : 'text-text-dim hover:text-white'}`}
                    >°F</button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Language</label>
                <select 
                  value={settings?.language || ''} 
                  onChange={(e) => updateSetting('language', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-primary/50 text-sm appearance-none"
                >
                  <option>English</option>
                  <option>Arabic</option>
                  <option>French</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
            {message && <p className={`text-xs font-bold text-center mt-2 ${message.includes('success') ? 'text-success' : 'text-error'}`}>{message}</p>}
          </div>

          {/* System Preferences */}
          <div className="glass p-8 rounded-2xl border border-card-border space-y-8">
            <h3 className="text-lg font-bold">System Preferences</h3>
            
            <div className="space-y-6">
              {[
                { id: 'darkMode', label: 'Dark Mode', sub: 'Enable or disable dark mode appearance', icon: Moon },
                { id: 'autoLogout', label: 'Auto Logout', sub: 'Automatically log out after inactivity', icon: LogOut, hasSelect: true },
                { id: 'soundEffects', label: 'Sound Effects', sub: 'Play sounds for notifications and actions', icon: Volume2 },
                { id: 'animations', label: 'Animations', sub: 'Enable interface animations', icon: Activity },
              ].map((pref) => (
                <div key={pref.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-lg bg-white/5 text-text-dim">
                      <pref.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{pref.label}</p>
                      <p className="text-[11px] text-text-dim">{pref.sub}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {pref.hasSelect && (
                      <select 
                        value={settings?.[pref.id as keyof DeviceSettings] as string} 
                        onChange={(e) => updateSetting(pref.id as keyof DeviceSettings, e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-[11px] font-bold outline-none"
                      >
                        <option>15 minutes</option>
                        <option>30 minutes</option>
                        <option>1 hour</option>
                      </select>
                    )}
                    {typeof settings?.[pref.id as keyof DeviceSettings] === 'boolean' && (
                      <button 
                        onClick={() => updateSetting(pref.id as keyof DeviceSettings, !settings?.[pref.id as keyof DeviceSettings])}
                        className={`w-11 h-6 rounded-full transition-colors relative ${settings?.[pref.id as keyof DeviceSettings] ? 'bg-primary' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings?.[pref.id as keyof DeviceSettings] ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 space-y-8">
          {/* Security Settings */}
          <div className="glass p-8 rounded-2xl border border-card-border space-y-8">
            <h3 className="text-lg font-bold">Security Settings</h3>
            
            <div className="space-y-6">
              {[
                { id: 'twoFactor', label: 'Two-Factor Authentication', sub: 'Add an extra layer of security to your account', icon: Shield },
                { id: 'loginAlerts', label: 'Login Alerts', sub: 'Get notified when someone logs in to your account', icon: Bell },
              ].map((sec) => (
                <div key={sec.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-lg bg-white/5 text-text-dim">
                      <sec.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{sec.label}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => updateSetting(sec.id as keyof DeviceSettings, !settings?.[sec.id as keyof DeviceSettings])}
                    className={`w-11 h-6 rounded-full transition-colors relative ${settings?.[sec.id as keyof DeviceSettings] ? 'bg-primary' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings?.[sec.id as keyof DeviceSettings] ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>
              ))}

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-lg bg-white/5 text-text-dim">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Session Management</p>
                    <p className="text-[11px] text-text-dim">Manage your active sessions</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[10px] font-bold uppercase transition-all">View Sessions</button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-lg bg-white/5 text-text-dim">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Change Password</p>
                    <p className="text-[11px] text-text-dim">Update your account password</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[10px] font-bold uppercase transition-all">Change Password</button>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="glass p-8 rounded-2xl border border-card-border space-y-8">
            <h3 className="text-lg font-bold">Notification Settings</h3>
            
            <div className="space-y-6">
              {[
                { id: 'emailNotifications', label: 'Email Notifications', sub: 'Receive notifications via email', icon: Mail },
                { id: 'pushNotifications', label: 'Push Notifications', sub: 'Receive push notifications on your devices', icon: Smartphone },
                { id: 'systemAlerts', label: 'System Alerts', sub: 'Important system alerts and warnings', icon: Bell },
                { id: 'marketingUpdates', label: 'Marketing Updates', sub: 'Receive updates about new features', icon: Zap },
              ].map((notif) => (
                <div key={notif.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-lg bg-white/5 text-text-dim">
                      <notif.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{notif.label}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => updateSetting(notif.id as keyof DeviceSettings, !settings?.[notif.id as keyof DeviceSettings])}
                    className={`w-11 h-6 rounded-full transition-colors relative ${settings?.[notif.id as keyof DeviceSettings] ? 'bg-primary' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings?.[notif.id as keyof DeviceSettings] ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Account Settings */}
          <div className="glass p-8 rounded-2xl border border-card-border space-y-8">
            <h3 className="text-lg font-bold">Account Settings</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-lg bg-white/5 text-text-dim">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Account Email</p>
                    <p className="text-[11px] text-primary">admin@smartluck.com</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[10px] font-bold uppercase transition-all">Update Email</button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-lg bg-white/5 text-error">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-error">Delete Account</p>
                    <p className="text-[11px] text-text-dim">Permanently delete your account and all data</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-error/10 hover:bg-error/20 border border-error/10 rounded-lg text-[10px] font-bold uppercase text-error transition-all">Delete Account</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
