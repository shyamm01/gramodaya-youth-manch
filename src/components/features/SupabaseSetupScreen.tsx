'use client';
import React, { useState, useEffect } from 'react';
import {
  supabaseUrl,
  supabaseAnonKey,
  updateSupabaseCredentials,
  testSupabaseConnection,
} from '../../lib/supabase';
import {
  Database,
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldCheck,
  Server,
  Lock,
  Eye,
  EyeOff,
  MessageSquare,
  Users,
  CreditCard,
  HardDrive,
  Zap,
} from 'lucide-react';

interface SupabaseSetupScreenProps {
  onClose?: () => void;
  inlineMode?: boolean;
}

export const SupabaseSetupScreen: React.FC<SupabaseSetupScreenProps> = ({
  onClose,
  inlineMode = false,
}) => {
  const [projectUrl, setProjectUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'CONNECTED' | 'FAILED'>('IDLE');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    // Populate current non-example values if available
    if (supabaseUrl && !supabaseUrl.includes('example.supabase.co')) {
      setProjectUrl(supabaseUrl);
    }
    if (supabaseAnonKey && !supabaseAnonKey.includes('sb_publishable_aEMlGQAprHz9Ws')) {
      setAnonKey(supabaseAnonKey);
    }
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('IDLE');
    setStatusMessage('');

    const cleanUrl = projectUrl.trim();
    const cleanKey = anonKey.trim();

    if (!cleanUrl) {
      setStatus('FAILED');
      setStatusMessage('Please enter your Supabase Project URL.');
      return;
    }

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      setStatus('FAILED');
      setStatusMessage('Project URL must start with "https://" or "http://".');
      return;
    }

    if (!cleanKey) {
      setStatus('FAILED');
      setStatusMessage('Please enter your Supabase Publishable / Anon Key.');
      return;
    }

    setIsConnecting(true);

    try {
      // 1. Update active Supabase client and save to localStorage
      updateSupabaseCredentials(cleanUrl, cleanKey);

      // 2. Sync to server environment endpoint
      try {
        await fetch('/api/config/supabase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: cleanUrl, anonKey: cleanKey }),
        });
      } catch (err) {
        console.warn('Backend environment sync non-critical warning:', err);
      }

      // 3. Test connection live with Supabase project
      const testResult = await testSupabaseConnection(cleanUrl, cleanKey);

      if (testResult.success) {
        setStatus('CONNECTED');
        setStatusMessage('Supabase Connected');
      } else {
        setStatus('FAILED');
        setStatusMessage(testResult.message || 'Connection Failed');
      }
    } catch (err: any) {
      setStatus('FAILED');
      setStatusMessage(err?.message || 'Connection Failed');
    } finally {
      setIsConnecting(false);
    }
  };

  const content = (
    <div className="bg-white rounded-2xl border border-[#E0DCCF] shadow-xl p-5 sm:p-6 max-w-xl mx-auto w-full">
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#E0DCCF]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 flex-shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-[#2C3327]">
              Supabase Configuration
            </h3>
            <p className="text-xs text-[#8C8675] font-medium">
              Gramodaya Youth Manch - Cloud Database & Service Connection
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-[#8C8675] hover:text-[#2C3327] hover:bg-[#F0EDE4] rounded-lg transition cursor-pointer text-xs font-bold"
            title="Close Setup"
          >
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleConnect} className="space-y-4">
        {/* INPUT 1: SUPABASE PROJECT URL */}
        <div>
          <label className="block text-xs font-extrabold text-[#2C3327] uppercase tracking-wider mb-1.5">
            1. SUPABASE PROJECT URL
          </label>
          <div className="relative">
            <Server className="absolute left-3.5 top-3.5 w-4 h-4 text-[#8C8675]" />
            <input
              type="url"
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="w-full pl-10 pr-4 py-3 bg-[#F9F8F6] border border-[#E0DCCF] rounded-xl text-xs sm:text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#4B634D] text-[#2C3327] transition"
              required
            />
          </div>
        </div>

        {/* INPUT 2: SUPABASE PUBLISHABLE / ANON KEY */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-extrabold text-[#2C3327] uppercase tracking-wider">
              2. SUPABASE PUBLISHABLE / ANON KEY
            </label>
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="text-[11px] font-bold text-[#4B634D] hover:underline flex items-center gap-1 cursor-pointer"
            >
              {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showKey ? 'Hide Key' : 'Show Key'}</span>
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-[#8C8675]" />
            {showKey ? (
              <textarea
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="Paste your Supabase publishable/anon key here"
                rows={3}
                className="w-full pl-10 pr-12 py-2.5 bg-[#F9F8F6] border border-[#E0DCCF] rounded-xl text-xs sm:text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#4B634D] text-[#2C3327] resize-none transition"
                required
              />
            ) : (
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="Paste your Supabase publishable/anon key here"
                className="w-full pl-10 pr-12 py-3 bg-[#F9F8F6] border border-[#E0DCCF] rounded-xl text-xs sm:text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#4B634D] text-[#2C3327] transition"
                required
              />
            )}
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-3.5 p-1 text-[#8C8675] hover:text-[#2C3327] transition cursor-pointer"
              title={showKey ? 'Hide Key' : 'Show Key'}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* BUTTON: CONNECT SUPABASE */}
        <button
          type="submit"
          disabled={isConnecting}
          className="w-full py-3.5 bg-[#4B634D] hover:bg-[#3B4F3D] active:bg-[#2C3327] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Validating Connection...</span>
            </>
          ) : (
            <>
              <Database className="w-4 h-4" />
              <span>CONNECT SUPABASE</span>
            </>
          )}
        </button>
      </form>

      {/* SUCCESS STATUS: Green "Supabase Connected" */}
      {status === 'CONNECTED' && (
        <div className="mt-5 p-4 bg-emerald-50 border-2 border-emerald-500 rounded-xl space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 text-emerald-900 font-black text-sm sm:text-base">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>✅ Supabase Connected</span>
          </div>
          <p className="text-xs text-emerald-800 font-medium">
            Project configuration validated successfully. The following system modules are now actively linked:
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-[#2C3327] pt-1">
            <div className="flex items-center gap-1.5 bg-white p-2 rounded-lg border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Authentication (OTP)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white p-2 rounded-lg border border-emerald-200">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Database</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white p-2 rounded-lg border border-emerald-200">
              <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
              <span>Storage</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white p-2 rounded-lg border border-emerald-200">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Realtime</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white p-2 rounded-lg border border-emerald-200">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Member Portal</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white p-2 rounded-lg border border-emerald-200">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Live Chat</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white p-2 rounded-lg border border-emerald-200 col-span-2">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              <span>Digital ID Card System</span>
            </div>
          </div>
        </div>
      )}

      {/* FAILURE STATUS: Red "Connection Failed" */}
      {status === 'FAILED' && (
        <div className="mt-5 p-4 bg-red-50 border-2 border-red-500 rounded-xl space-y-2 animate-fade-in">
          <div className="flex items-center gap-2 text-red-900 font-black text-sm sm:text-base">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span>❌ Connection Failed</span>
          </div>
          <p className="text-xs text-red-700 font-medium">
            {statusMessage || 'Unable to connect to Supabase. Check your Project URL and Publishable/Anon key.'}
          </p>
        </div>
      )}

      {/* SECURITY NOTICE */}
      <div className="mt-4 pt-3 border-t border-[#E0DCCF] flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#8C8675] gap-2">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span>🔒 Service Role / Secret keys are NEVER requested or stored.</span>
        </span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-[#4B634D] hover:underline cursor-pointer self-end sm:self-auto"
          >
            बंद करें (Close)
          </button>
        )}
      </div>
    </div>
  );

  if (inlineMode) {
    return content;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      {content}
    </div>
  );
};

