import React, { useState, useEffect } from 'react';
import { ModelSpecs, ChatSession, Language } from '../types';
import { UI_STRINGS } from '../constants';
import { Plus, MessageSquare, Trash2, Zap, Brain, X, Info, Hexagon } from 'lucide-react';
import { MemoryService, Synapse } from '../services/memoryService';

interface SidebarProps {
  specs: ModelSpecs;
  sessions: ChatSession[];
  currentId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  language: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  specs, sessions, currentId, onSelect, onDelete, onNew, language 
}) => {
  const t = UI_STRINGS[language];
  const [synapses, setSynapses] = useState<Synapse[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSynapses(MemoryService.getSynapses());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="flex flex-col h-full w-full bg-[#f8f9fa] dark:bg-[#08080a] border-r border-zinc-200 dark:border-zinc-900 p-4 transition-colors duration-300">
      
      {/* New Chat Button */}
      <button 
        onClick={onNew}
        className="w-full py-3.5 px-4 mb-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
      >
        <Plus className="w-4 h-4" />
        <span>{t.newChat}</span>
      </button>

      {/* History List */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
        <h2 className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em] mb-4 px-2">Conversations</h2>
        {sessions.map(s => (
          <div 
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`
              group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all
              ${s.id === currentId 
                ? 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-indigo-600 dark:text-zinc-100 shadow-sm' 
                : 'text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-900/50 hover:text-zinc-700 dark:hover:text-zinc-300'}
            `}
          >
            <div className="flex items-center space-x-3 overflow-hidden">
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span className="text-xs font-semibold truncate">{s.title || "New synchronization"}</span>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}
              className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {/* Neural Brain Section */}
        <div className="mt-8">
          <div className="flex items-center space-x-2 px-2 mb-4">
            <Brain className="w-3 h-3 text-indigo-500 animate-pulse" />
            <h2 className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Neural Synapses</h2>
          </div>
          <div className="space-y-2">
            {synapses.length === 0 ? (
              <div className="px-2 py-3 bg-zinc-100 dark:bg-zinc-900/30 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 flex items-center space-x-2">
                <Info className="w-3 h-3 text-zinc-400" />
                <span className="text-[10px] text-zinc-500 font-medium">Awaiting facts to store...</span>
              </div>
            ) : (
              synapses.map(s => (
                <div key={s.id} className="group flex items-center justify-between p-2.5 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-all hover:border-indigo-500/30">
                  <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-300 truncate pr-2">{s.fact}</span>
                  <button 
                    onClick={() => MemoryService.deleteSynapse(s.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-red-500 transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer / Specs */}
      <div className="pt-6 mt-6 border-t border-zinc-200 dark:border-zinc-900">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
           <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-500 relative">
                <Hexagon className="w-8 h-8 absolute animate-spin-slow opacity-20" />
                <Zap className="w-5 h-5 relative z-10" />
              </div>
              <div className="flex-1">
                 <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Core</p>
                 <p className="text-xs font-black dark:text-zinc-100">{specs.name}-2 Omni</p>
              </div>
           </div>
           <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
             Handcrafted by Usama Systems. Multimodal Brain Active.
           </p>
        </div>
      </div>
    </aside>
  );
};