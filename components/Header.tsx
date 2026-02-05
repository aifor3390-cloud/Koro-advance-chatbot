
import React, { useState, useRef, useEffect } from 'react';
import { Theme, Language } from '../types';
import { Sun, Moon, Zap, Search, X, Loader2, Cpu } from 'lucide-react';

interface HeaderProps {
  activeModel: string;
  author: string;
  theme: Theme;
  onToggleTheme: () => void;
  language: Language;
  onSetLanguage: (lang: Language) => void;
  onSearch: (query: string) => void;
  isSearching?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeModel, theme, onToggleTheme, language, onSetLanguage, onSearch, isSearching
}) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      setSearchQuery('');
      setIsSearchExpanded(false);
    }
  };

  return (
    <div className="flex items-center justify-between w-full h-full">
      <div className="flex items-center space-x-4">
        <div className="hidden lg:flex w-8 h-8 bg-indigo-600 rounded-lg items-center justify-center text-white font-black text-sm shadow-lg">K</div>
        <div className={isSearchExpanded ? 'hidden sm:block' : ''}>
           <h1 className="text-sm font-bold tracking-tight uppercase text-slate-900 dark:text-zinc-100">{activeModel}</h1>
           <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">Neural State: Optimal</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 md:space-x-4 flex-1 justify-end">
        {/* Expandable Search Bar */}
        <div className={`relative flex items-center transition-all duration-500 ease-out ${isSearchExpanded ? 'flex-1 max-w-md' : 'w-10'}`}>
          <form 
            onSubmit={handleSearchSubmit}
            className={`flex items-center w-full transition-all duration-500 ${isSearchExpanded ? 'bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl pr-2 pl-4 border border-indigo-500/30 shadow-lg' : 'bg-transparent'}`}
          >
            <Search 
              className={`w-4 h-4 shrink-0 transition-colors ${isSearchExpanded ? 'text-indigo-500' : 'text-zinc-500 hover:text-indigo-500 cursor-pointer'}`} 
              onClick={() => !isSearchExpanded && setIsSearchExpanded(true)}
            />
            <input 
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Knowledge & Web..."
              className={`bg-transparent border-0 h-10 text-xs font-bold text-slate-800 dark:text-zinc-100 focus:ring-0 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 transition-all duration-500 overflow-hidden ${isSearchExpanded ? 'w-full ml-3 opacity-100' : 'w-0 opacity-0'}`}
              onBlur={() => !searchQuery && setIsSearchExpanded(false)}
            />
            {isSearchExpanded && (
              <button 
                type="button" 
                onClick={() => { setIsSearchExpanded(false); setSearchQuery(''); }}
                className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5 text-zinc-500" />
              </button>
            )}
          </form>
        </div>

        {!isSearchExpanded && (
          <>
            <div className="hidden sm:flex items-center bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-xl">
              {(['en', 'ur', 'ar'] as Language[]).map(lang => (
                <button
                  key={lang}
                  onClick={() => onSetLanguage(lang)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${language === lang ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-400'}`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <button 
              onClick={onToggleTheme}
              className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-indigo-600/10 border border-indigo-500/20 rounded-xl">
               <Zap className="w-3.5 h-3.5 text-indigo-500" />
               <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Platinum Omni</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
