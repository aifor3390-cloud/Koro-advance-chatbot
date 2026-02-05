
import React, { useState } from 'react';
import { X, Wand2, Sparkles, User, Image as ImageIcon, Palette, Zap, Check, Loader2 } from 'lucide-react';
import { AvatarService, AvatarStyle } from '../services/avatarService';

interface AvatarWorkshopProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (avatarData: string) => void;
}

export const AvatarWorkshop: React.FC<AvatarWorkshopProps> = ({ isOpen, onClose, onApply }) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<AvatarStyle>('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  if (!isOpen) return null;

  const styles: { id: AvatarStyle; label: string; icon: string; color: string }[] = [
    { id: 'professional', label: 'Pro', icon: '👔', color: 'bg-blue-500' },
    { id: 'cyberpunk', label: 'Neon', icon: '🌃', color: 'bg-emerald-500' },
    { id: 'anime', label: 'Anime', icon: '🌸', color: 'bg-rose-500' },
    { id: '3d-render', label: '3D', icon: '🧊', color: 'bg-indigo-500' },
    { id: 'pixel-art', label: 'Retro', icon: '👾', color: 'bg-amber-500' },
    { id: 'oil-painting', label: 'Classic', icon: '🎨', color: 'bg-violet-500' },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const result = await AvatarService.generateAvatar(prompt, style);
      setPreview(result);
    } catch (err) {
      alert("Neural synthesis failed. Grid error.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-[3rem] shadow-[0_0_100px_rgba(79,70,229,0.3)] overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col md:flex-row h-[90vh] md:h-auto">
        
        {/* Left Side: Controls */}
        <div className="flex-1 p-8 md:p-10 space-y-8 border-b md:border-b-0 md:border-r border-zinc-100 dark:border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-600/10 rounded-2xl text-indigo-600 dark:text-indigo-400">
                <Palette className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Avatar Lab</h2>
                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.3em]">Identity Synthesis</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-1 flex items-center space-x-2">
              <User className="w-3 h-3" />
              <span>Subject / Identity Logic</span>
            </label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A futuristic space pilot with white hair, smiling..."
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl p-5 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none h-32 text-slate-800 dark:text-zinc-100 shadow-inner"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Aesthetic Synthesis Preset</label>
            <div className="grid grid-cols-3 gap-3">
              {styles.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all relative overflow-hidden group/style ${style === s.id ? 'bg-zinc-100 dark:bg-zinc-800 border-indigo-500 ring-2 ring-indigo-500/20' : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-white/5 text-zinc-500'}`}
                >
                  {style === s.id && <div className={`absolute top-0 right-0 w-8 h-8 ${s.color} opacity-20 blur-lg`} />}
                  <span className="text-xl mb-1 relative z-10">{s.icon}</span>
                  <span className={`text-[9px] font-black uppercase tracking-widest relative z-10 ${style === s.id ? 'text-indigo-500' : ''}`}>{s.label}</span>
                  {style === s.id && <Check className="absolute top-2 right-2 w-2 h-2 text-indigo-500" />}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center space-x-3 active:scale-95"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
            <span>{isGenerating ? 'Engaging Neural Core...' : 'Generate Avatar'}</span>
          </button>
        </div>

        {/* Right Side: Preview */}
        <div className="flex-1 bg-zinc-50 dark:bg-zinc-900/50 p-8 md:p-10 flex flex-col items-center justify-center relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>

          <div className="w-full max-w-[300px] aspect-square relative group">
            <div className={`absolute inset-0 blur-3xl rounded-full opacity-30 transition-all duration-700 ${isGenerating ? 'bg-indigo-500 animate-pulse' : 'bg-zinc-400'}`} />
            <div className="relative w-full h-full rounded-[3.5rem] overflow-hidden border-2 border-white dark:border-zinc-800 p-2 bg-white/50 dark:bg-zinc-950/50 shadow-2xl backdrop-blur-sm transition-transform duration-500 group-hover:scale-[1.02]">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-[3rem]" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-700 space-y-4">
                  <ImageIcon className="w-16 h-16 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center px-10">Neural Projection Pending</p>
                </div>
              )}
              {isGenerating && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <Loader2 className="w-12 h-12 text-white animate-spin" />
                      <Zap className="absolute inset-0 m-auto w-5 h-5 text-indigo-400 animate-pulse" />
                    </div>
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.4em] animate-pulse">Synthesizing...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-10 w-full max-w-[300px] space-y-4">
            <button 
              onClick={() => preview && onApply(preview)}
              disabled={!preview || isGenerating}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center space-x-2 active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Apply to Profile</span>
            </button>
            <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-[0.3em] text-center leading-relaxed">
              * adoption of persona updates local neural registry immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
