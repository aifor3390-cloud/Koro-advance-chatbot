import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, ArrowRight, Loader2 } from 'lucide-react';
import { User } from '../types';

const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// Fix: Added className prop to AppleLogo to support custom styling and resolve TS error
const AppleLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 384 512" width="20" height="20" fill="currentColor" className={className}>
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 21.8-88.5 21.8-11.4 0-51.1-20.8-82.3-20.8-65.3 0-102.1 53.5-102.1 117.9 0 46.4 14.9 124.6 54.6 182.7 18.2 26.3 42.3 41.9 68.9 42.4 24.8.5 36.6-15.5 67.4-15.5 30.7 0 42.5 15.5 67.4 15 26.5-.5 50.7-15.5 68.9-42.4 7.2-10.4 14.3-20.6 19.9-30.9-74.7-30.7-81.7-114.8-81.7-114.8zM245.2 64c26.9-33.4 24.6-67.5 24.6-67.5s-34.1 1.5-61 34.9c-26.1 32.5-21.5 66.2-21.5 66.2s31.1 1.6 57.9-33.6z" />
  </svg>
);

// Fix: Added className prop to XLogo to support custom styling and resolve TS error
const XLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSimulatedAuth = (provider: User['provider']) => {
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
      const mockUser: User = {
        id: Math.random().toString(36).substring(7),
        name: name || (provider === 'email' ? email.split('@')[0] : `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`),
        email: email || `${provider}@example.com`,
        provider: provider,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name || provider}`
      };
      onLogin(mockUser);
      setIsLoading(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSimulatedAuth('email');
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#050507] flex items-center justify-center p-4 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse delay-1000" />
      
      <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-zinc-900/50 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-500/10 ring-1 ring-white/5">
          <div className="text-center mb-10">
            <div className="inline-flex w-16 h-16 bg-indigo-600 rounded-2xl items-center justify-center text-white font-black text-2xl mb-6 shadow-xl shadow-indigo-600/40">K</div>
            <h1 className="text-3xl font-black tracking-tight text-white mb-2">Neural Gateway</h1>
            <p className="text-zinc-400 text-sm font-medium tracking-wide uppercase">Synchronize your consciousness</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Neural Designation (Name)" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-800/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium"
                  required={isSignUp}
                />
              </div>
            )}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                type="email" 
                placeholder="Interface Address (Email)" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-800/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium"
                required
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                type="password" 
                placeholder="Access Token (Password)" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-800/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium"
                required
              />
            </div>

            <button 
              disabled={isLoading}
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-black py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95 group mt-6"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? 'Initiate Core' : 'Enter Neural Grid'}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <span className="relative px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 bg-[#121214] rounded-full">Third Party Sync</span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <button 
              onClick={() => handleSimulatedAuth('google')}
              className="flex items-center justify-center p-4 bg-zinc-800/50 border border-white/5 rounded-2xl hover:bg-zinc-700/50 transition-all active:scale-90"
              title="Sync with Google"
            >
              <GoogleLogo />
            </button>
            <button 
              onClick={() => handleSimulatedAuth('apple')}
              className="flex items-center justify-center p-4 bg-zinc-800/50 border border-white/5 rounded-2xl hover:bg-zinc-700/50 transition-all active:scale-90"
              title="Sync with Apple"
            >
              <AppleLogo className="text-white" />
            </button>
            <button 
              onClick={() => handleSimulatedAuth('x')}
              className="flex items-center justify-center p-4 bg-zinc-800/50 border border-white/5 rounded-2xl hover:bg-zinc-700/50 transition-all active:scale-90"
              title="Sync with X"
            >
              <XLogo className="text-white" />
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-zinc-500 font-medium">
            {isSignUp ? 'Already synchronized?' : 'Need a neural profile?'}
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="ml-2 text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
            >
              {isSignUp ? 'Sync Core' : 'Initiate Core'}
            </button>
          </p>
        </div>
        
        <p className="mt-6 text-center text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em]">Proprietary Usama Systems</p>
      </div>
    </div>
  );
};