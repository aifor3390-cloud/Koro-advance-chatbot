
import React from 'react';
import { Theme, Language } from '../types';

interface HeaderProps {
  activeModel: string;
  author: string;
  theme: Theme;
  onToggleTheme: () => void;
  language: Language;
  onSetLanguage: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeModel, author, theme, onToggleTheme, language, onSetLanguage }) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-12 py-8 glass-light dark:glass border-b border-zinc-200 dark:border-zinc-900 bg-white/50 dark:bg-[#050507]/60">
      <div className="flex items-center space-x-6">
        <div className="relative group cursor-help">
          <div className="absolute inset-0 bg-indigo-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-60 transition-opacity animate-pulse"></div>
          <div className="relative w-14 h-14 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-2xl shadow-indigo-600/40 border border-white/20 transform-3d group-hover:rotate-12 transition-transform duration-500">
            K
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-black tracking-tighter dark:text-white uppercase">
              {activeModel}
            </h1>
            <div className="flex space-x-1">
               <div className="w-1 h-1 bg-indigo-500 rounded-full"></div>
               <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
               <div className="w-1 h-1 bg-indigo-500 rounded-full"></div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
            <p className="text-[10px] text-emerald-500 dark:text-emerald-400 uppercase tracking-[0.4em] font-black">Link Active</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="hidden md:flex items-center space-x-2 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          {(['en', 'ur', 'ar'] as Language[]).map(lang => (
            <button
              key={lang}
              onClick={() => onSetLanguage(lang)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                language === lang 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        <button 
          onClick={onToggleTheme}
          className="p-4 rounded-[1.2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 shadow-xl shadow-indigo-500/5 transition-all transform active:scale-90"
        >
          {theme === 'dark' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          )}
        </button>
      </div>
    </header>
  );
};
