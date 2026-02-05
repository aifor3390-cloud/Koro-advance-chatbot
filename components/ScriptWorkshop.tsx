
import React, { useState } from 'react';
import { X, Video, Type, Clock, Sparkles, Wand2, Youtube, Music, Terminal, Film } from 'lucide-react';

interface ScriptWorkshopProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => void;
}

export const ScriptWorkshop: React.FC<ScriptWorkshopProps> = ({ isOpen, onClose, onGenerate }) => {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('youtube');
  const [tone, setTone] = useState('professional');
  const [duration, setDuration] = useState('5');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = `[NEURAL_SCRIPT_DIRECTIVE]:
Generate a highly engaging and professional video script for ${platform}.
TOPIC: ${topic}
TONE: ${tone}
TARGET DURATION: ${duration} minutes

The script MUST include:
1. An attention-grabbing Hook.
2. Clearly marked "VISUALS" and "NARRATION" columns/sections.
3. Timestamps for pacing.
4. A call to action at the end.
Format the narration text clearly so I can use your TTS engine to voice it later.`;
    
    onGenerate(prompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-[3rem] shadow-[0_0_80px_rgba(99,102,241,0.2)] overflow-hidden animate-in zoom-in-95 duration-500">
        
        {/* Header Section */}
        <div className="p-8 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/30">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-600/10 rounded-2xl text-indigo-600 dark:text-indigo-400">
              <Film className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Script Workshop</h2>
              <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.3em]">Neural Content Generation</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-2xl text-zinc-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
          {/* Topic Input */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-1 flex items-center space-x-2">
              <Type className="w-3 h-3" />
              <span>Core Subject / Topic</span>
            </label>
            <textarea 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., The future of AI in 2025, or A tutorial on baking the perfect sourdough..."
              className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-[1.5rem] p-5 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none h-32 text-slate-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-inner"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Platform Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 flex items-center space-x-2">
                <Youtube className="w-3 h-3" />
                <span>Target Platform</span>
              </label>
              <select 
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl p-4 text-xs font-bold text-slate-700 dark:text-zinc-300 outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="youtube">YouTube (Long-form)</option>
                <option value="shorts/tiktok">Shorts / TikTok</option>
                <option value="documentary">Documentary Script</option>
                <option value="educational">Educational / Course</option>
              </select>
            </div>

            {/* Tone Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 flex items-center space-x-2">
                <Sparkles className="w-3 h-3" />
                <span>Creative Tone</span>
              </label>
              <select 
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl p-4 text-xs font-bold text-slate-700 dark:text-zinc-300 outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="professional">Professional & Crisp</option>
                <option value="hype/energetic">High-Energy & Hype</option>
                <option value="storytelling">Storytelling & Emotional</option>
                <option value="casual/minimalist">Casual & Relatable</option>
              </select>
            </div>
          </div>

          {/* Duration Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center space-x-2">
                <Clock className="w-3 h-3" />
                <span>Target Duration</span>
              </label>
              <span className="text-xs font-black text-indigo-500">{duration} minutes</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="20" 
              step="1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[8px] font-black text-zinc-400 uppercase tracking-widest px-1">
              <span>Short Clip</span>
              <span>Full Video</span>
            </div>
          </div>

          <div className="pt-6 flex space-x-4">
            <button 
              type="button"
              onClick={onClose} 
              className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl border border-zinc-200 dark:border-white/5 transition-all hover:bg-zinc-200 dark:hover:bg-zinc-800"
            >
              Abort Synthesis
            </button>
            <button 
              type="submit"
              className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center space-x-2 active:scale-95"
            >
              <Wand2 className="w-4 h-4" />
              <span>Assemble Script</span>
            </button>
          </div>

          <div className="flex items-center justify-center space-x-3 text-zinc-400">
             <Music className="w-3.5 h-3.5 text-indigo-500" />
             <p className="text-[9px] font-bold uppercase tracking-widest italic text-center">
               Script is optimized for Koro's Gentleman/Lady Voice Synthesis.
             </p>
          </div>
        </form>
      </div>
    </div>
  );
};
