'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Zap, 
  LayoutGrid, 
  Globe, 
  ChevronDown,
  LogIn,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verboseError, setVerboseError] = useState<any>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setVerboseError(null);

    try {
      const response = await api.post('/api/auth/login', { username, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        username: response.data.username,
        role: response.data.role
      }));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      setVerboseError(err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-dark p-4 sm:p-0 overflow-hidden">
      <div className="max-w-5xl w-full h-[650px] flex rounded-3xl overflow-hidden glass shadow-2xl animate-fade-in border border-white/5">
        
        {/* Left Side - Design */}
        <div className="hidden lg:block w-5/12 relative overflow-hidden group">
          <Image 
            src="/login-bg.png" 
            alt="Smart Home" 
            fill 
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/40 to-transparent"></div>
          
          <div className="absolute inset-0 p-12 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                <ShieldCheck className="text-white w-7 h-7" />
              </div>
              <div>
                <h1 className="font-bold text-xl leading-tight uppercase tracking-wider">Smart Luck</h1>
                <p className="text-[10px] text-text-dim uppercase tracking-[0.2em]">Controller</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-4xl font-bold leading-tight">
                  Smart Home,<br />
                  <span className="text-primary">Smarter</span> Living
                </h2>
                <p className="text-sm text-text-dim max-w-xs leading-relaxed">
                  Control your doors, gates, lights and all devices from anywhere, anytime.
                </p>
              </div>

              <div className="space-y-5 pt-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-white/10 mt-1">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Secure</h4>
                    <p className="text-[11px] text-text-dim">Advanced encryption keeps your home safe.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-white/10 mt-1">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Real-time Control</h4>
                    <p className="text-[11px] text-text-dim">Control and monitor your home in real-time.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-white/10 mt-1">
                    <LayoutGrid className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Easy to Use</h4>
                    <p className="text-[11px] text-text-dim">Intuitive dashboard for complete home management.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 p-8 sm:p-12 md:p-16 flex flex-col bg-card-dark/40">
          <div className="flex justify-end mb-8">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
              <Globe className="w-4 h-4 text-text-dim" />
              <span className="text-xs font-medium">English</span>
              <ChevronDown className="w-3 h-3 text-text-dim" />
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-10">
              <h3 className="text-3xl font-bold mb-2">Welcome Back</h3>
              <p className="text-text-dim text-sm">Please sign in to your account to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-dim">Email Address / Username</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-primary transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Enter your username" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 focus:bg-primary/5 transition-all text-sm"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-dim">Password</label>
                  <a href="#" className="text-[10px] text-primary hover:underline font-bold">Forgot password?</a>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-primary transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter your password" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-12 outline-none focus:border-primary/50 focus:bg-primary/5 transition-all text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-dim hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-error/10 border border-error/20 flex gap-3 animate-shake">
                  <AlertCircle className="w-5 h-5 text-error shrink-0" />
                  <div className="space-y-1">
                    <p className="text-xs text-error font-bold leading-tight">{error}</p>
                    {verboseError?.detail && (
                      <pre className="text-[9px] text-error/70 font-mono mt-1 overflow-x-auto whitespace-pre-wrap">
                        {verboseError.detail}
                      </pre>
                    )}
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-hover py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    <span>Sign In</span>
                  </>
                )}
              </button>

              <div className="relative flex items-center justify-center my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <span className="relative px-4 text-[10px] uppercase tracking-widest text-text-dim bg-transparent">or continue with</span>
              </div>

              <button 
                type="button"
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm"
              >
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span>Use Security Code</span>
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-xs text-text-dim">
                Don't have an account? <a href="#" className="text-primary hover:underline font-bold">Contact your administrator</a>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-6 text-[10px] text-text-dim/50 uppercase tracking-widest hidden sm:block">
        © 2024 Smart Luck Controller. All rights reserved.
      </div>
    </div>
  );
}
