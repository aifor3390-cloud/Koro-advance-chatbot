
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, Theme, Attachment } from '../types';
import { FileText, Download, ExternalLink, Maximize2, ChevronDown, ChevronUp, Cpu, Globe, Info, ShieldCheck, Search } from 'lucide-react';

interface ChatBoxProps {
  message: Message;
  theme: Theme;
  isNew?: boolean;
}

const AttachmentPreview: React.FC<{ attachment: Attachment }> = ({ attachment }) => {
  const dataUrl = `data:${attachment.mimeType};base64,${attachment.data}`;

  if (attachment.type === 'image') {
    return (
      <div className="mb-4 rounded-3xl overflow-hidden border border-zinc-200 dark:border-white/10 shadow-lg group/img relative bg-zinc-100 dark:bg-zinc-800">
        <img 
          src={dataUrl} 
          alt={attachment.name || "Image"} 
          className="max-w-full h-auto object-cover hover:scale-[1.01] transition-transform duration-700 cursor-zoom-in"
          onClick={() => window.open(dataUrl, '_blank')}
        />
        <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover/img:opacity-100 transition-opacity">
          <a href={dataUrl} download={attachment.name || 'image.png'} className="p-2.5 bg-black/60 backdrop-blur-md rounded-xl text-white hover:bg-indigo-600 transition-colors shadow-lg">
             <Download className="w-4 h-4" />
          </a>
          <button onClick={() => window.open(dataUrl, '_blank')} className="p-2.5 bg-black/60 backdrop-blur-md rounded-xl text-white hover:bg-indigo-600 transition-colors shadow-lg">
             <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (attachment.type === 'video') {
    return (
      <div className="mb-4 rounded-3xl overflow-hidden border border-zinc-200 dark:border-white/10 shadow-2xl bg-black group/video relative">
        <video controls className="w-full aspect-video">
          <source src={dataUrl} type={attachment.mimeType} />
          Your browser does not support the video tag.
        </video>
        <div className="absolute top-3 right-3 opacity-0 group-hover/video:opacity-100 transition-opacity">
          <a href={dataUrl} download={attachment.name || 'video.mp4'} className="p-2.5 bg-black/60 backdrop-blur-md rounded-xl text-white hover:bg-indigo-600 transition-colors">
             <Download className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/50 flex items-center justify-between group/doc hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-300">
      <div className="flex items-center space-x-4 overflow-hidden">
        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 shadow-inner">
          <FileText className="w-6 h-6" />
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-bold truncate text-slate-800 dark:text-zinc-100">{attachment.name || "Document"}</p>
          <div className="flex items-center space-x-2">
            <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">{attachment.mimeType.split('/')[1]}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button 
          onClick={() => window.open(dataUrl, '_blank')}
          className="p-3 text-zinc-400 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-xl transition-all"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const ChatBox: React.FC<ChatBoxProps> = ({ message, theme }) => {
  const [showThoughts, setShowThoughts] = useState(true);
  const isAssistant = message.role === 'assistant';
  const isSearchResult = message.content.includes("Intelligence Briefing") || message.content.startsWith("🔍");

  return (
    <div className={`
      flex flex-col ${isAssistant ? 'items-start' : 'items-end'} 
      group w-full animate-in fade-in slide-in-from-bottom-2 duration-500
    `}>
      <div className="flex items-center space-x-3 mb-3 px-4">
        {isAssistant && (
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-xs font-black text-white border border-white/20 shadow-lg">
            K
          </div>
        )}
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-500 uppercase tracking-[0.3em]">
            {isAssistant ? 'Koro Platinum' : 'Neural Operator'}
          </span>
          {isAssistant && isSearchResult && (
            <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-md text-[8px] font-black text-indigo-500 uppercase tracking-widest flex items-center space-x-1">
              <Search className="w-2.5 h-2.5" />
              <span>Search Insight</span>
            </span>
          )}
        </div>
        {!isAssistant && (
          <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-xs font-black text-zinc-500 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700">
            O
          </div>
        )}
      </div>
      
      <div className={`
        relative max-w-[95%] md:max-w-[85%] rounded-[2rem] px-8 py-6 text-lg leading-relaxed 
        transition-all border
        ${isAssistant 
          ? 'bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800 rounded-tl-none shadow-xl dark:shadow-none' 
          : 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none shadow-xl shadow-indigo-600/20'
        }
      `}>
        {isAssistant && message.thoughtProcess && message.thoughtProcess.length > 0 && (
          <div className="mb-6">
            <button 
              onClick={() => setShowThoughts(!showThoughts)}
              className="flex items-center space-x-2 p-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700/50 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors w-full group/thought"
            >
              <Cpu className="w-4 h-4 text-indigo-500" />
              <span className="flex-1 text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 text-left">
                Neural Reasoning Synthesis
              </span>
              {showThoughts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showThoughts && (
              <div className="mt-3 space-y-2 pl-4 border-l-2 border-indigo-500/30 animate-in fade-in slide-in-from-top-2">
                {message.thoughtProcess.map((thought, idx) => (
                  <p key={idx} className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 italic">
                    <span className="text-indigo-500 mr-2">●</span> {thought}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="relative z-10 break-words markdown-content">
          {message.attachments?.map(att => (
            <AttachmentPreview key={att.id} attachment={att} />
          ))}

          {message.content === "" && isAssistant && !message.thoughtProcess ? (
            <div className="flex space-x-1 py-2">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
            </div>
          ) : (
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                pre: ({node, ...props}) => (
                  <div className="relative group/code my-4">
                    <pre className="bg-zinc-50 dark:bg-zinc-800 p-6 rounded-2xl overflow-x-auto border border-zinc-200 dark:border-zinc-700 font-mono text-sm leading-6" {...props} />
                  </div>
                ),
                p: ({children}) => <p className="mb-4 last:mb-0 leading-8">{children}</p>,
                ul: ({children}) => <ul className="list-disc ml-6 mb-4 space-y-2">{children}</ul>,
                h1: ({children}) => <h1 className="text-2xl font-black mb-4 tracking-tight text-indigo-600 dark:text-indigo-400">{children}</h1>,
                h2: ({children}) => <h2 className="text-xl font-bold mb-3 tracking-tight text-indigo-500">{children}</h2>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}

          {isAssistant && message.groundingChunks && message.groundingChunks.length > 0 && (
            <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-cyan-500 dark:text-cyan-400 uppercase tracking-[0.2em] flex items-center space-x-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Neural Grounding</span>
                </p>
                <Globe className="w-3.5 h-3.5 text-zinc-400 animate-spin-slow" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {message.groundingChunks.map((chunk, idx) => chunk.web && (
                  <a 
                    key={idx}
                    href={chunk.web.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col bg-zinc-50 dark:bg-zinc-800/30 hover:bg-white dark:hover:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 rounded-2xl p-4 transition-all group/source shadow-sm hover:shadow-md hover:border-cyan-500/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2 overflow-hidden">
                        <div className="w-6 h-6 bg-cyan-500/10 rounded-lg flex items-center justify-center text-cyan-500 shrink-0">
                          <Globe className="w-3 h-3" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-800 dark:text-zinc-200 truncate pr-2">
                          {chunk.web.title || "External Intelligence"}
                        </span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-zinc-400 group-hover/source:text-cyan-500 transition-colors" />
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Info className="w-3 h-3 text-cyan-500/50 mt-0.5 shrink-0" />
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2 italic">
                        {chunk.web.snippet || "Accessing decentralized data fragment from the global neural grid..."}
                      </p>
                    </div>

                    <div className="mt-3 text-[9px] text-zinc-400 font-black uppercase tracking-widest truncate">
                      {new URL(chunk.web.uri).hostname}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-3 flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 px-4">
        <span className="text-[10px] text-zinc-400 dark:text-zinc-600 font-black uppercase tracking-widest">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <div className="w-1 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full"></div>
        <button 
          className="text-[10px] text-indigo-500 font-black uppercase tracking-widest hover:text-indigo-600 transition-colors" 
          onClick={() => navigator.clipboard.writeText(message.content)}
        >
          Copy
        </button>
      </div>
    </div>
  );
};
