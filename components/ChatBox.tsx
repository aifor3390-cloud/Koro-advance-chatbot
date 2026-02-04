
import React from 'react';
import { Message, Theme } from '../types';

interface ChatBoxProps {
  message: Message;
  theme: Theme;
  isNew?: boolean;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ message, theme, isNew }) => {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`
      flex flex-col ${isAssistant ? 'items-start' : 'items-end'} 
      group perspective-2000 transform-3d w-full
      animate-in fade-in slide-in-from-bottom-2 duration-500
    `}>
      <div className="flex items-center space-x-3 mb-3 px-4">
        {isAssistant && (
          <div className="relative transform-3d">
            <div className="absolute inset-0 bg-indigo-500 blur-md opacity-40 rounded-xl"></div>
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-xs font-black text-white relative z-10 border border-white/20 shadow-lg">
              K
            </div>
          </div>
        )}
        <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.3em]">
          {isAssistant ? 'Koro Engine' : 'User Terminal'}
        </span>
        {!isAssistant && (
          <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-xs font-black text-zinc-500 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700">
            U
          </div>
        )}
      </div>
      
      <div className={`
        relative max-w-[90%] md:max-w-[85%] rounded-[2rem] px-8 py-6 text-lg leading-relaxed 
        transition-all duration-700 transform chat-bubble-3d border transform-3d
        ${isAssistant 
          ? 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800 rounded-tl-none shadow-2xl dark:shadow-none' 
          : 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none shadow-2xl shadow-indigo-600/20'
        }
      `}>
        {/* Subtle Inner Glow for Assistant */}
        {isAssistant && <div className="absolute top-0 left-0 w-24 h-24 bg-indigo-500/5 blur-3xl rounded-full -ml-8 -mt-8"></div>}
        
        <div className="relative z-10 break-words">
          {message.content.split('\n').map((line, i) => (
            <p key={i} className={line.trim() === '' ? 'h-4' : 'mb-3 last:mb-0'}>
              {line}
            </p>
          ))}
          {isAssistant && message.content === "" && (
            <div className="flex space-x-1 py-2">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-3 flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 px-4">
        <span className="text-[10px] text-zinc-400 dark:text-zinc-600 font-black uppercase tracking-widest">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <div className="w-1 h-1 bg-zinc-700 rounded-full"></div>
        <button 
          className="text-[10px] text-indigo-500 font-black uppercase tracking-widest hover:text-indigo-400 transition-colors" 
          onClick={() => {
            navigator.clipboard.writeText(message.content);
            const btn = document.activeElement as HTMLElement;
            if (btn) btn.innerText = "Copied!";
            setTimeout(() => { if (btn) btn.innerText = "Copy"; }, 2000);
          }}
        >
          Copy
        </button>
      </div>
    </div>
  );
};
