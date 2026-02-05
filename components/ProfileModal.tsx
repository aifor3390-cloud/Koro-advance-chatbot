
import React, { useState, useRef } from 'react';
import { X, User as UserIcon, Camera, Save, ShieldCheck, Upload, Sparkles, Loader2 } from 'lucide-react';

interface ProfileModalProps {
  user: { name: string; avatar: string; email?: string };
  onClose: () => void;
  onSave: (updated: { name: string; avatar: string }) => void;
  onOpenAvatarWorkshop: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onSave, onOpenAvatarWorkshop }) => {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [isSyncing, setIsSyncing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    onSave({ name, avatar });
    setIsSyncing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
        
        <div className="relative p-8 md:p-10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Operator Identity</h2>
              <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.4em]">Neural Core Profile</p>
            </div>
            <button onClick={onClose} className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-2xl border border-zinc-200 dark:border-white/5">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start space-y-8 md:space-y-0 md:space-x-8">
            {/* Avatar Preview & Actions */}
            <div className="flex flex-col items-center space-y-4 shrink-0">
              <div className="relative group">
                <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full group-hover:opacity-100 transition-opacity opacity-50" />
                <div className="relative w-36 h-36 rounded-[2.5rem] overflow-hidden border-2 border-indigo-500/30 p-1.5 bg-zinc-100 dark:bg-zinc-800 shadow-2xl transition-transform hover:scale-105">
                  <img src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=Koro`} alt="Avatar" className="w-full h-full object-cover rounded-[2rem]" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-2">
                     <button onClick={() => fileInputRef.current?.click()} className="p-2.5 bg-indigo-600 text-white rounded-xl hover:scale-110 transition-transform">
                       <Upload className="w-4 h-4" />
                     </button>
                  </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
              </div>
              
              <button 
                onClick={onOpenAvatarWorkshop}
                className="flex items-center space-x-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-indigo-500 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open Avatar Lab</span>
              </button>
            </div>

            {/* Profile Fields */}
            <div className="flex-1 w-full space-y-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Operator Designation</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-indigo-500" />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/5 rounded-2xl py-4 pl-12 pr-4 text-slate-800 dark:text-zinc-100 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                </div>
                <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                  <div className="flex items-center space-x-3 mb-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Registry Verified</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed italic">
                    "Identity verified against local neural grid. Session integrity remains high."
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex space-x-4">
            <button onClick={onClose} className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-black text-[10px] uppercase tracking-widest rounded-2xl border border-zinc-200 dark:border-white/5 transition-all">
              Abort Sync
            </button>
            <button onClick={handleSave} disabled={isSyncing} className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center space-x-2">
              {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Commit Sync</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
