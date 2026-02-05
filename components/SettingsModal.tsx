
import React from 'react';
import { X, Settings, Moon, Sun, Globe, Trash2, Brain, Cpu, Database, ShieldCheck, Info, RotateCcw } from 'lucide-react';
import { Theme, Language, ModelSpecs } from '../types';
import { MemoryService } from '../services/memoryService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  language: Language;
  onSetLanguage: (lang: Language) => void;
  specs: ModelSpecs;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onToggleTheme,
  language,
  onSetLanguage,
  specs
}) => {
  if (!isOpen) return null;

  const synapseCount = MemoryService.getSynapses().length;

  const handleClearMemory = () => {
    if (confirm("Initiate Neural Wipe? This will permanently delete all stored synapses and facts about you.")) {
      MemoryService.clearAll();
      window.location.reload(); // Refresh to clear state
    }
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/5 animate-in zoom-in-95 duration-500">
        
        {/* Header Section */}
        <div className="p-8 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/30">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-600/10 rounded-2xl text-indigo-600 dark:text-indigo-400">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Neural Config</h2>
              <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.3em]">Core Parameters & Logic</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl text-zinc-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
          
          {/* Section: Core Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-indigo-500" />
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">System Architecture</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/5 rounded-2xl">
                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-1">Revision</p>
                <p className="text-xs font-bold dark:text-zinc-200">{specs.version}</p>
              </div>
              <div className="p-4 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/5 rounded-2xl">
                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-1">Architecture</p>
                <p className="text-xs font-bold dark:text-zinc-200 truncate">{specs.architecture}</p>
              </div>
            </div>
          </div>

          {/* Section: Appearance & Language */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Appearance</h3>
              </div>
              <button 
                onClick={onToggleTheme}
                className="w-full flex items-center justify-between p-4 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/5 rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all"
              >
                <span className="text-xs font-bold dark:text-zinc-300 uppercase tracking-widest">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-cyan-500" />
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Localization</h3>
              </div>
              <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-white/5">
                {(['en', 'ur', 'ar'] as Language[]).map(lang => (
                  <button
                    key={lang}
                    onClick={() => onSetLanguage(lang)}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${language === lang ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Neural Memory */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4 text-indigo-500" />
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Memory Manifold</h3>
            </div>
            <div className="p-6 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/5 rounded-3xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold dark:text-zinc-200">Active Synapses</p>
                    <p className="text-[10px] text-zinc-500 font-medium">{synapseCount} facts currently indexed</p>
                  </div>
                </div>
                <button 
                  onClick={handleClearMemory}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Neural Wipe</span>
                </button>
              </div>
              
              <div className="p-4 bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-white/5 flex items-start space-x-3">
                <ShieldCheck className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
                  Koro's memory is stored locally in your browser's neural buffer. No personal data is transmitted to central servers for identity harvesting.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 pt-0 flex flex-col items-center">
          <div className="w-full h-px bg-zinc-100 dark:bg-white/5 mb-6" />
          <div className="flex items-center space-x-2 text-zinc-400">
             <Info className="w-3.5 h-3.5" />
             <p className="text-[9px] font-black uppercase tracking-[0.2em]">Usama Systems • Platinum Revision 2.7.5</p>
          </div>
        </div>
      </div>
    </div>
  );
};
