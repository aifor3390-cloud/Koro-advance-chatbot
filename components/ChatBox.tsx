
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, Theme, Attachment } from '../types';
import { FileText, Download, ExternalLink, PlayCircle, Maximize2 } from 'lucide-react';

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
          <p className="text-sm font-bold truncate dark:text-zinc-100">{attachment.name || "Document"}</p>
          <div className="flex items-center space-x-2">
            <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">{attachment.mimeType.split('/')[1]}</p>
            {attachment.size && (
              <>
                <div className="w-1 h-1 bg-zinc-600 rounded-full" />
                <p className="text-[10px] text-zinc-400 font-bold">{(attachment.size / 1024).toFixed(1)} KB</p>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button 
          onClick={() => window.open(dataUrl, '_blank')}
          className="p-3 text-zinc-400 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-xl transition-all"
          title="Open file"
        >
          <ExternalLink className="w-4.5 h-4.5" />
        </button>
        <a 
          href={dataUrl} 
          download={attachment.name || 'document'} 
          className="p-3 text-zinc-400 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-xl transition-all"
          title="Download file"
        >
          <Download className="w-4.5 h-4.5" />
        </a>
      </div>
    </div>
  );
};

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
        relative max-w-[95%] md:max-w-[85%] rounded-[2rem] px-8 py-6 text-lg leading-relaxed 
        transition-all duration-700 transform chat-bubble-3d border transform-3d
        ${isAssistant 
          ? 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800 rounded-tl-none shadow-2xl dark:shadow-none' 
          : 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none shadow-2xl shadow-indigo-600/20'
        }
      `}>
        {isAssistant && <div className="absolute top-0 left-0 w-24 h-24 bg-indigo-500/5 blur-3xl rounded-full -ml-8 -mt-8"></div>}
        
        <div className="relative z-10 break-words markdown-content">
          {message.attachments?.map(att => (
            <AttachmentPreview key={att.id} attachment={att} />
          ))}

          {message.content === "" && isAssistant ? (
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
                    <pre className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-2xl overflow-x-auto border border-zinc-200 dark:border-zinc-700 font-mono text-sm leading-6" {...props} />
                    <button 
                      onClick={() => {
                        const codeText = (node?.children[0] as any)?.children[0]?.value || "";
                        navigator.clipboard.writeText(codeText);
                      }}
                      className="absolute top-4 right-4 p-2 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-500 hover:text-white rounded-lg transition-all opacity-0 group-hover/code:opacity-100 shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ),
                p: ({children}) => <p className="mb-4 last:mb-0 leading-8">{children}</p>,
                ul: ({children}) => <ul className="list-disc ml-6 mb-4 space-y-2">{children}</ul>,
                ol: ({children}) => <ol className="list-decimal ml-6 mb-4 space-y-2">{children}</ol>,
                li: ({children}) => <li className="leading-7">{children}</li>,
                h1: ({children}) => <h1 className="text-2xl font-black mb-4 tracking-tight text-indigo-600 dark:text-indigo-400">{children}</h1>,
                h2: ({children}) => <h2 className="text-xl font-black mb-3 tracking-tight text-indigo-500 dark:text-indigo-300">{children}</h2>,
                blockquote: ({children}) => <blockquote className="border-l-4 border-indigo-500 pl-4 py-2 italic bg-indigo-500/5 rounded-r-lg mb-4">{children}</blockquote>
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}

          {isAssistant && message.groundingChunks && message.groundingChunks.length > 0 && (
            <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3">Verified Sources</p>
              <div className="flex flex-wrap gap-2">
                {message.groundingChunks.map((chunk, idx) => chunk.web && (
                  <a 
                    key={idx}
                    href={chunk.web.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 bg-zinc-100 dark:bg-zinc-800/50 hover:bg-indigo-500/10 border border-zinc-200 dark:border-zinc-700/60 rounded-xl px-3 py-1.5 transition-all group/link"
                  >
                    <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 truncate max-w-[150px] group-hover/link:text-indigo-500">
                      {chunk.web.title || chunk.web.uri}
                    </span>
                    <ExternalLink className="w-2.5 h-2.5 text-zinc-400 group-hover/link:text-indigo-500" />
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
        <div className="w-1 h-1 bg-zinc-700 rounded-full"></div>
        <button 
          className="text-[10px] text-indigo-500 font-black uppercase tracking-widest hover:text-indigo-400 transition-colors" 
          onClick={() => {
            navigator.clipboard.writeText(message.content);
          }}
        >
          Copy Synchronization
        </button>
      </div>
    </div>
  );
};
