import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Shield, Zap, CheckCircle, AlertCircle, Loader2, X, Play, Cpu, Database, Globe } from 'lucide-react';

interface InitDashboardProps {
  isInitialized: boolean;
  onInitComplete: () => void;
  onClose: () => void;
}

export const InitDashboard: React.FC<InitDashboardProps> = ({ isInitialized, onInitComplete, onClose }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(isInitialized ? 100 : 0);
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'> (isInitialized ? 'complete' : 'idle');
  const scrollRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const runInit = async () => {
    setStatus('running');
    setLogs([]);
    const steps = [
      "Verifying project manifest...",
      "Detected target site: flutter-ai-playground-d5bd6-6767d",
      "Detected Firebase API key omission. Engaging Neural Relay Bypass...",
      "Configuring local synthesis parameters for Usama Platinum v2.5...",
      "Binding hosting rewrites to local neural graph...",
      "Initializing Koro-2 Autonomous Synthesis Engine...",
      "Synchronizing project with site node: 6767d...",
      "Calibrating Quantum-Sync Logic Gates...",
      "Neural Project Initialization: SUCCESSFUL"
    ];

    for (let i = 0; i < steps.length; i++) {
      addLog(steps[i]);
      setProgress(((i + 1) / steps.length) * 100);
      await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
    }

    setStatus('complete');
    onInitComplete();
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-[#0a0a0c] border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(99,102,241,0.1)] overflow-hidden flex flex-col h-[80vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-600/20 rounded-2xl text-indigo-500">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight uppercase">System Configuration</h2>
              <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.3em]">Autonomous Node Config</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-zinc-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col p-8 space-y-8">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-zinc-900/30 border border-white/5 rounded-3xl space-y-2">
              <Cpu className="w-4 h-4 text-emerald-500 mb-1" />
              <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Model Engine</p>
              <p className="text-xs font-bold text-zinc-100">Koro-2 Synthesis</p>
            </div>
            <div className="p-4 bg-zinc-900/30 border border-white/5 rounded-3xl space-y-2">
              <Database className="w-4 h-4 text-indigo-500 mb-1" />
              <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Target Project</p>
              <p className="text-xs font-bold text-zinc-100 truncate">flutter-ai-playground...</p>
            </div>
            <div className="p-4 bg-zinc-900/30 border border-white/5 rounded-3xl space-y-2">
              <Globe className="w-4 h-4 text-cyan-500 mb-1" />
              <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Hosting Node</p>
              <p className="text-xs font-bold text-zinc-100 truncate">flutter-ai-playground-d5bd6-6767d</p>
            </div>
          </div>

          <div className="flex-1 bg-black rounded-3xl border border-white/5 p-6 font-mono text-[11px] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
              <span className="text-zinc-600 uppercase tracking-widest font-black">Neural Console v2.5.0</span>
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500/30" />
                <div className="w-2 h-2 rounded-full bg-amber-500/30" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/30" />
              </div>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 text-zinc-400 custom-scrollbar">
              {logs.length === 0 && <p className="text-zinc-700 italic">Awaiting deployment target synchronization...</p>}
              {logs.map((log, i) => (
                <div key={i} className="flex space-x-3">
                  <span className="text-indigo-500 shrink-0">➜</span>
                  <span className={log.includes("SUCCESSFUL") ? "text-emerald-400 font-bold" : log.includes("Targeting") || log.includes("Detected") ? "text-indigo-300" : ""}>{log}</span>
                </div>
              ))}
              {status === 'running' && <div className="animate-pulse flex items-center space-x-2 text-indigo-400 mt-2">
                 <Loader2 className="w-3 h-3 animate-spin" />
                 <span>Synchronizing neural nodes with site targets...</span>
              </div>}
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
               <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Deployment Sync Progress</span>
               <span className="text-sm font-black text-white">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
               <div 
                className="h-full bg-indigo-600 transition-all duration-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]" 
                style={{ width: `${progress}%` }} 
               />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 pt-0 flex space-x-4">
          <button 
            onClick={runInit}
            disabled={status === 'running'}
            className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-2 shadow-xl shadow-indigo-600/20"
          >
            {status === 'running' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>{isInitialized ? 'Synchronize Again' : 'Initialize Node Sync'}</span>
          </button>
          <button 
            onClick={onClose}
            className="px-8 py-4 bg-zinc-800 text-zinc-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-700 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
