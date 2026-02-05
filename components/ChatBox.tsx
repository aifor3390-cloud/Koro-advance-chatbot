
import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, Theme, Attachment, CharacterProfile } from '../types';
import { 
  FileText, Download, ExternalLink, Maximize2, ChevronDown, ChevronUp, 
  Cpu, Globe, Info, ShieldCheck, Search, Volume2, Loader2, 
  Music, Play, Pause, User, Users, Palette, Sparkles, Wand2, RotateCcw,
  RefreshCw, Zap
} from 'lucide-react';
import { TTSService, VoicePersona } from '../services/ttsService';
import { AvatarService } from '../services/avatarService';

interface ChatBoxProps {
  message: Message;
  theme: Theme;
  onUpdateMessage?: (msg: Message) => void;
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

export const ChatBox: React.FC<ChatBoxProps> = ({ message, theme, onUpdateMessage }) => {
  const [showThoughts, setShowThoughts] = useState(true);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [persona, setPersona] = useState<VoicePersona>('gentleman');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const isAssistant = message.role === 'assistant';
  const isSearchResult = message.content.includes("Intelligence Briefing") || message.content.startsWith("🔍");

  const handleGenerateVoice = async () => {
    if (audioUrl) {
      toggleAudio();
      return;
    }

    setIsGeneratingVoice(true);
    setVoiceError(null);
    try {
      // Use a slightly shorter slice for TTS to prevent common 500 timeout errors
      const result = await TTSService.generateSpeech(message.content.slice(0, 1500), persona);
      setAudioUrl(result.audioUrl);
      setIsPlaying(true);
      setTimeout(() => audioRef.current?.play(), 100);
    } catch (err: any) {
      console.error("Voice Sync Failed", err);
      setVoiceError(err.message || "Neural Sync Relay Timeout (500)");
    } finally {
      setIsGeneratingVoice(false);
    }
  };

  const handleGenerateCharacterAvatar = async (charIdx: number) => {
    if (!message.characters || !onUpdateMessage) return;
    
    const updatedChars = [...message.characters];
    updatedChars[charIdx] = { ...updatedChars[charIdx], isGenerating: true };
    onUpdateMessage({ ...message, characters: updatedChars });

    try {
      // Uses the character's unique visualPrompt for generation
      const avatarUrl = await AvatarService.generateAvatar(
        updatedChars[charIdx].visualPrompt, 
        'professional'
      );
      updatedChars[charIdx] = { ...updatedChars[charIdx], avatarUrl, isGenerating: false };
      onUpdateMessage({ ...message, characters: updatedChars });
    } catch (err) {
      console.error("Character Avatar Error", err);
      updatedChars[charIdx] = { ...updatedChars[charIdx], isGenerating: false };
      onUpdateMessage({ ...message, characters: updatedChars });
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `Koro_${persona}_Script.wav`;
    a.click();
  };

  const resetVoice = () => {
    setAudioUrl(null);
    setIsPlaying(false);
    setVoiceError(null);
  };

  return (
    <div className={`
      flex flex-col ${isAssistant ? 'items-start' : 'items-end'} 
      group w-full animate-in fade-in slide-in-from-bottom-2 duration-500
    `}>
      <div className="flex items-center space-x-3 mb-3 px-4">
        {isAssistant && (
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-xs font-black text-white border border-white/20 shadow-lg relative">
             <div className="absolute inset-0 bg-indigo-500/50 blur-md animate-pulse"></div>
             <span className="relative z-10">K</span>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-500 uppercase tracking-[0.3em]">
            {isAssistant ? 'Koro Platinum Core' : 'Neural Operator'}
          </span>
          {isAssistant && isSearchResult && (
            <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-md text-[8px] font-black text-indigo-500 uppercase tracking-widest flex items-center space-x-1">
              <Search className="w-2.5 h-2.5" />
              <span>Deep Analysis</span>
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
                Neural Reasoning Chain
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

          {/* Character Workshop Section - Now with advanced avatar generation & regeneration */}
          {isAssistant && message.characters && message.characters.length > 0 && (
            <div className="mt-10 p-6 bg-zinc-100 dark:bg-zinc-950/50 rounded-3xl border border-zinc-200 dark:border-indigo-500/20 shadow-inner">
               <div className="flex items-center justify-between mb-6 px-1">
                 <div className="flex items-center space-x-3">
                   <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20">
                     <Palette className="w-4 h-4" />
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Neural Character Lab</p>
                     <p className="text-xs font-bold dark:text-zinc-300">Script Personas Detected</p>
                   </div>
                 </div>
                 <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {message.characters.map((char, idx) => (
                   <div key={idx} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden group/char flex flex-col h-full shadow-sm hover:shadow-md transition-all duration-300">
                     {/* Visual Persona Area */}
                     <div className="aspect-square relative bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                        {char.avatarUrl && !char.isGenerating ? (
                          <div className="w-full h-full relative group/img-container">
                            <img 
                              src={char.avatarUrl} 
                              alt={char.name} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover/img-container:scale-105" 
                            />
                            {/* Hover Overlay for Regeneration */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img-container:opacity-100 transition-opacity flex items-center justify-center">
                               <button 
                                 onClick={() => handleGenerateCharacterAvatar(idx)}
                                 className="p-4 bg-white/20 backdrop-blur-md text-white rounded-2xl hover:bg-indigo-600 transition-all border border-white/20 shadow-2xl group/regen"
                                 title="Regenerate Visual Persona"
                               >
                                 <RefreshCw className="w-6 h-6 group-hover/regen:rotate-180 transition-transform duration-500" />
                               </button>
                            </div>
                          </div>
                        ) : char.isGenerating ? (
                          <div className="flex flex-col items-center space-y-4">
                             <div className="relative">
                               <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                               <Zap className="w-4 h-4 text-indigo-300 absolute inset-0 m-auto animate-pulse" />
                             </div>
                             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500 animate-pulse">Synthesizing...</span>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleGenerateCharacterAvatar(idx)}
                            className="flex flex-col items-center space-y-3 opacity-40 hover:opacity-100 transition-all group/gen-btn"
                          >
                             <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-700 rounded-2xl flex items-center justify-center group-hover/gen-btn:scale-110 group-hover/gen-btn:bg-indigo-500/10 group-hover/gen-btn:text-indigo-500 transition-all">
                               <User className="w-8 h-8" />
                             </div>
                             <span className="text-[9px] font-black uppercase tracking-[0.2em]">Generate Persona</span>
                          </button>
                        )}
                        
                        {/* Name Chip */}
                        <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-xl text-[9px] font-black text-white uppercase tracking-widest border border-white/10 z-10 shadow-lg">
                          {char.name}
                        </div>
                     </div>

                     {/* Persona Description & Logic */}
                     <div className="p-5 flex-1 flex flex-col">
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed line-clamp-3 mb-5 italic">
                          "{char.description}"
                        </p>
                        
                        <div className="mt-auto space-y-2">
                           {char.avatarUrl && !char.isGenerating ? (
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => window.open(char.avatarUrl, '_blank')}
                                  className="flex-1 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all border border-emerald-500/20 flex items-center justify-center space-x-2"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Download</span>
                                </button>
                                <button 
                                  onClick={() => handleGenerateCharacterAvatar(idx)}
                                  className="px-4 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-indigo-600 rounded-2xl transition-all border border-zinc-200 dark:border-zinc-700 flex items-center justify-center group/btn-regen"
                                  title="Regenerate Persona"
                                >
                                  <RefreshCw className="w-4 h-4 group-hover/btn-regen:rotate-180 transition-transform duration-500" />
                                </button>
                              </div>
                           ) : (
                              <button 
                                onClick={() => handleGenerateCharacterAvatar(idx)}
                                disabled={char.isGenerating}
                                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-2 active:scale-95"
                              >
                                {char.isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                                <span>{char.isGenerating ? 'Engaging Core...' : 'Generate Avatar'}</span>
                              </button>
                           )}
                           
                           {/* Small info tip */}
                           <div className="flex items-center justify-center space-x-1.5 pt-1">
                             <Info className="w-2.5 h-2.5 text-zinc-400" />
                             <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Driven by visualPrompt Logic</span>
                           </div>
                        </div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {/* Voice Generation Section */}
          {isAssistant && message.content.length > 20 && (
            <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
              
              {/* Persona Selector */}
              {!audioUrl && !isGeneratingVoice && (
                <div className="flex flex-col space-y-2">
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Voice Persona</span>
                  <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl w-fit">
                    <button 
                      onClick={() => setPersona('gentleman')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${persona === 'gentleman' ? 'bg-white dark:bg-zinc-700 text-indigo-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                    >
                      <User className="w-3 h-3" />
                      <span>Gentleman</span>
                    </button>
                    <button 
                      onClick={() => setPersona('lady')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${persona === 'lady' ? 'bg-white dark:bg-zinc-700 text-indigo-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                    >
                      <Users className="w-3 h-3" />
                      <span>Lady</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <button 
                  onClick={handleGenerateVoice}
                  disabled={isGeneratingVoice}
                  className={`
                    flex items-center space-x-3 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all
                    ${audioUrl 
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                      : (voiceError ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20')}
                    disabled:opacity-50
                  `}
                >
                  {isGeneratingVoice ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : audioUrl ? (
                    isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                  <span>{isGeneratingVoice ? 'Synthesizing...' : voiceError ? 'Retry Neural Sync' : audioUrl ? (isPlaying ? 'Pause Audio' : 'Resume Audio') : `Synthesize ${persona}`}</span>
                </button>

                {audioUrl && (
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={resetVoice}
                      className="p-3 text-zinc-400 hover:text-indigo-500 transition-colors"
                      title="Change Voice"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={downloadAudio}
                      className="p-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-xl transition-all border border-zinc-200 dark:border-zinc-700 flex items-center justify-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">WAV</span>
                    </button>
                  </div>
                )}
              </div>

              {voiceError && (
                <div className="flex items-center space-x-2 text-[9px] text-red-500 font-bold uppercase tracking-widest animate-pulse">
                  <Info className="w-3 h-3" />
                  <span>{voiceError}</span>
                </div>
              )}

              {audioUrl && (
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700/50 flex items-center space-x-4 animate-in fade-in slide-in-from-top-2">
                   <div className={`p-2.5 rounded-xl ${isPlaying ? 'bg-indigo-500 text-white animate-pulse' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'}`}>
                     <Music className="w-4 h-4" />
                   </div>
                   <div className="flex-1 overflow-hidden">
                     <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Neural Audio Stream: {persona}</p>
                     <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium truncate">24kHz High Fidelity • PCM Encoding</p>
                   </div>
                   <audio 
                    ref={audioRef} 
                    src={audioUrl} 
                    onEnded={() => setIsPlaying(false)} 
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    className="hidden" 
                   />
                </div>
              )}
            </div>
          )}

          {isAssistant && message.groundingChunks && message.groundingChunks.length > 0 && (
            <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-cyan-500 dark:text-cyan-400 uppercase tracking-[0.2em] flex items-center space-x-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Knowledge Base</span>
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
