
import React, { useState, useRef } from 'react';
import { X, User as UserIcon, Camera, RefreshCw, Save, ShieldCheck, Upload, Trash2 } from 'lucide-react';
import { User } from '../types';

interface ProfileModalProps {
  user: User;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onSave }) => {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateNeuralAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=6366f1`;
    setAvatar(newAvatar);
  };

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
    // Simulate neural sync latency
    await new Promise(resolve => setTimeout(resolve, 1200));
    onSave({ ...user, name, avatar });
    setIsSyncing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-zinc-900/90 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden ring-1 ring-white/10 animate-in zoom-in-95 duration-500">
        {/* Header Decor */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-indigo-600/20 to-transparent pointer-events-none" />
        
        <div className="relative p-8">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight font-['Space_Grotesk']">Neural Profile</h2>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em]">Identity Designation</p>
            </div>
            <button 
              onClick={onClose}
              className="p-3 bg-zinc-800/50 text-zinc-400 hover:text-white rounded-2xl transition-all border border-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col items-center mb-10">
            <div className="relative group">
              <div className="absolute inset-0 bg-indigo-500/30 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-32 h-32 rounded-[2.5rem] overflow-hidden border-2 border-indigo-500/30 p-1 bg-zinc-900 shadow-2xl transition-transform group-hover:scale-105">
                <img 
                  src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover rounded-[2.2rem]"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-2">
                   <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-indigo-600 text-white rounded-xl hover:scale-110 transition-transform"
                   >
                     <Upload className="w-4 h-4" />
                   </button>
                   <button 
                    onClick={generateNeuralAvatar}
                    className="p-2 bg-zinc-700 text-white rounded-xl hover:scale-110 transition-transform"
                   >
                     <RefreshCw className="w-4 h-4" />
                   </button>
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*"
              />
            </div>
            <div className="mt-4 flex items-center space-x-2">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Procedural Syncing</span>
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2">Display Designation</label>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-indigo-400" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-800/30 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="Designate Operator Name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2">Registry Address</label>
              <div className="relative opacity-50 cursor-not-allowed">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input 
                  type="email" 
                  value={user.email}
                  disabled
                  className="w-full bg-zinc-800/30 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-zinc-400 text-sm font-medium"
                />
              </div>
            </div>
          </div>

          <div className="mt-12 flex space-x-3">
            <button 
              onClick={onClose}
              className="flex-1 py-4 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 font-black text-[10px] uppercase tracking-widest rounded-2xl border border-white/5 transition-all"
            >
              Abort Sync
            </button>
            <button 
              onClick={handleSave}
              disabled={isSyncing}
              className="flex-3 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl border border-indigo-500/30 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center space-x-2"
            >
              {isSyncing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Update Neural State</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
