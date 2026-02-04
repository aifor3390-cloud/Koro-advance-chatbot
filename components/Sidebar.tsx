
import React, { useMemo, useState } from 'react';
import { ModelSpecs, ChatSession, Language } from '../types';
import { UI_STRINGS } from '../constants';

interface SidebarProps {
  specs: ModelSpecs;
  sessions: ChatSession[];
  currentId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  language: Language;
  searchTerm: string;
  onSearch: (val: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  specs, sessions, currentId, onSelect, onDelete, onNew, language, searchTerm, onSearch 
}) => {
  const t = UI_STRINGS[language];
  const [showHelp, setShowHelp] = useState(false);

  const filteredSessions = useMemo(() => {
    if (!searchTerm.trim()) return sessions;

    const query = searchTerm.toLowerCase();
    
    // 1. Extract Exact Phrases (Text inside quotes)
    const exactPhrases: string[] = [];
    const quotedRegex = /"([^"]+)"/g;
    let match;
    let processedQuery = query;
    while ((match = quotedRegex.exec(query)) !== null) {
      exactPhrases.push(match[1]);
      processedQuery = processedQuery.replace(match[0], '');
    }

    // 2. Extract Date Filters (after:YYYY-MM-DD, before:YYYY-MM-DD)
    const afterMatch = query.match(/after:(\d{4}-\d{2}-\d{2})/);
    const beforeMatch = query.match(/before:(\d{4}-\d{2}-\d{2})/);
    const afterDate = afterMatch ? new Date(afterMatch[1]) : null;
    const beforeDate = beforeMatch ? new Date(beforeMatch[1]) : null;

    processedQuery = processedQuery.replace(/after:\d{4}-\d{2}-\d{2}/, '').replace(/before:\d{4}-\d{2}-\d{2}/, '');

    // 3. Extract Remaining Keywords
    const keywords = processedQuery.split(/\s+/).filter(k => k.length > 0);

    return sessions.filter(s => {
      const sessionDate = new Date(s.createdAt);
      
      // Date constraints
      if (afterDate && sessionDate < afterDate) return false;
      if (beforeDate && sessionDate > beforeDate) return false;

      const fullContent = (s.title + ' ' + s.messages.map(m => m.content).join(' ')).toLowerCase();

      // Exact phrase constraints
      for (const phrase of exactPhrases) {
        if (!fullContent.includes(phrase)) return false;
      }

      // Keyword constraints (OR match for general keywords if phrases/dates are also used, or AND? Let's do AND for precision)
      for (const keyword of keywords) {
        if (!fullContent.includes(keyword)) return false;
      }

      return true;
    });
  }, [sessions, searchTerm]);

  const hasActiveFilters = searchTerm.includes('"') || searchTerm.includes('after:') || searchTerm.includes('before:');

  return (
    <aside className="hidden lg:flex flex-col w-96 bg-white/80 dark:bg-[#08080a]/90 glass-light dark:glass border-r border-zinc-200 dark:border-zinc-900 p-8 z-20">
      <div className="flex flex-col space-y-6">
        <button 
          onClick={onNew}
          className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.5rem] font-bold text-sm uppercase tracking-widest shadow-xl shadow-indigo-600/30 transition-all transform hover:translate-y-[-2px] active:translate-y-[1px] flex items-center justify-center space-x-3"
        >
          <div className="bg-white/20 p-1.5 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </div>
          <span>{t.newChat}</span>
        </button>

        {/* Enhanced Search Bar */}
        <div className="relative group">
          <div className={`absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-0 transition duration-500 ${hasActiveFilters ? 'opacity-20' : 'group-focus-within:opacity-10'}`}></div>
          <div className="relative">
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              onFocus={() => setShowHelp(true)}
              onBlur={() => setTimeout(() => setShowHelp(false), 200)}
              placeholder="Search Archives..."
              className="w-full bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3.5 pl-11 pr-10 text-xs font-bold text-zinc-600 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            
            {searchTerm && (
              <button 
                onClick={() => onSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-indigo-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            )}
          </div>

          {/* Search Syntax Help Tooltip */}
          {showHelp && (
            <div className="absolute top-full left-0 right-0 mt-3 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">Search Operators</p>
              <ul className="space-y-2">
                <li className="flex justify-between items-center text-[10px]">
                  <code className="text-zinc-400 dark:text-zinc-500">"exact phrase"</code>
                  <span className="text-zinc-600 dark:text-zinc-400">Exact match</span>
                </li>
                <li className="flex justify-between items-center text-[10px]">
                  <code className="text-zinc-400 dark:text-zinc-500">after:2024-01-01</code>
                  <span className="text-zinc-600 dark:text-zinc-400">Filter by date</span>
                </li>
                <li className="flex justify-between items-center text-[10px]">
                  <code className="text-zinc-400 dark:text-zinc-500">before:2024-12-31</code>
                  <span className="text-zinc-600 dark:text-zinc-400">End range</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mt-8 mb-8 space-y-3 pr-2 scrollbar-hide">
        <div className="flex justify-between items-center px-2 mb-4">
          <h2 className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">{t.history}</h2>
          {searchTerm && (
            <span className="text-[9px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full">
              {filteredSessions.length} Results
            </span>
          )}
        </div>
        
        {filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 opacity-30 space-y-3">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
             <p className="text-xs italic tracking-tight">No archives match the criteria</p>
          </div>
        ) : (
          filteredSessions.map(s => (
            <div 
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={`
                group relative flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-300 border
                ${s.id === currentId 
                  ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-600 dark:text-indigo-400 scale-[1.02] shadow-lg shadow-indigo-500/5' 
                  : 'bg-transparent border-transparent text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:scale-[1.01]'}
              `}
            >
              <div className="flex items-center space-x-4 overflow-hidden">
                <div className={`w-2 h-2 rounded-full ${s.id === currentId ? 'bg-indigo-500 animate-pulse' : 'bg-zinc-700'}`}></div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold truncate tracking-tight">{s.title || "Empty Stream"}</span>
                  <span className="text-[9px] opacity-40 uppercase tracking-tighter">
                    {s.createdAt.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}
                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>
          ))
        )}
      </div>

      <div className="space-y-6 pt-8 border-t border-zinc-200 dark:border-zinc-900">
        <div className="p-6 bg-zinc-50 dark:bg-zinc-900/30 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 relative overflow-hidden group">
          <div className="absolute top-[-20%] right-[-20%] w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
          <p className="text-[10px] text-zinc-400 uppercase font-black mb-3 tracking-widest">{t.specs}</p>
          <div className="space-y-3">
             <div className="flex justify-between items-center">
                <span className="text-[9px] opacity-40 font-bold">CORE</span>
                <span className="text-[11px] font-mono text-indigo-500 font-bold">{specs.name}</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-[9px] opacity-40 font-bold">VERSION</span>
                <span className="text-[11px] font-mono text-zinc-400">{specs.version}</span>
             </div>
          </div>
        </div>
        
        <div className="relative group cursor-pointer overflow-hidden rounded-[2rem] p-6 text-white shadow-2xl shadow-indigo-600/30">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-indigo-900 group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute bottom-[-20px] right-[-20px] opacity-10">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/></svg>
          </div>
          <div className="relative z-10">
            <p className="text-[10px] text-indigo-200 uppercase font-black mb-2 tracking-[0.2em]">{t.developedBy}</p>
            <p className="text-2xl font-black tracking-tighter leading-none italic">{specs.author}</p>
            <p className="text-[9px] text-white/50 mt-4 font-mono">NEURAL CHIEF ARCHITECT</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
