
import React, { useState } from 'react';
import { Theme, Language, User } from '../types';
import { Sun, Moon, LogOut, Settings, User as UserIcon } from 'lucide-react';

interface HeaderProps {
  activeModel: string;
  author: string;
  theme: Theme;
  onToggleTheme: () => void;
  language: Language;
  onSetLanguage: (lang: Language) => void;
  user?: User | null;
  onLogout?: () => void;
  onOpenProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeModel, author, theme, onToggleTheme, language, onSetLanguage, user, onLogout, onOpenProfile 
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="flex items-center justify-between w-full h-full">
      <div className="flex items-center space-x-4">
        <div className="hidden lg:flex w-8 h-8 bg-indigo-600 rounded-lg items-center justify-center text-white font-black text-sm">K</div>
        <div>
           <h1 className="text-sm font-bold tracking-tight uppercase dark:text-zinc-100">{activeModel}</h1>
           <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">Neural Status: Online</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="hidden sm:flex items-center bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-xl mr-2">
          {(['en', 'ur', 'ar'] as Language[]).map(lang => (
            <button
              key={lang}
              onClick={() => onSetLanguage(lang)}
              className={`
                px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all
                ${language === lang 
                  ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-zinc-100 shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-400'}
              `}
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

        {user && (
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center space-x-2 p-1 pl-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors border border-transparent hover:border-white/5"
            >
              <div className="w-7 h-7 bg-indigo-600/20 rounded-lg flex items-center justify-center text-indigo-500 text-[10px] font-black uppercase overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs font-black dark:text-zinc-100 truncate">{user.name}</p>
                    <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
                  </div>
                  <div className="p-2">
                    <button 
                      onClick={() => { onOpenProfile?.(); setShowMenu(false); }}
                      className="w-full flex items-center space-x-3 p-2.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>Neural Profile</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 p-2.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                      <Settings className="w-4 h-4" />
                      <span>Sync Settings</span>
                    </button>
                    <button 
                      onClick={onLogout}
                      className="w-full flex items-center space-x-3 p-2.5 text-xs font-bold text-red-500 hover:bg-red-500/5 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Terminate Link</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
