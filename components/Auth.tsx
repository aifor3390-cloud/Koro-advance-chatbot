
import React, { useState, useEffect } from 'react';
import { Mail, Lock, Loader2, ShieldCheck, Zap, ChevronRight, User as UserIcon, AlertCircle, ArrowLeft, Eye, EyeOff, CheckCircle2, Terminal, Cpu, Globe } from 'lucide-react';
import { User } from '../types';
import { AuthService } from '../services/authService';

const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

interface AuthProps {
  onLogin: (user: User) => void;
}

type AuthMode = 'login' | 'signup' | 'reset';

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  useEffect(() => {
    setError(null);
    setSuccessMsg(null);
  }, [mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBypass = () => {
    onLogin({ 
      id: 'guest-' + Date.now(), 
      name: 'Bypass Operator', 
      email: 'bypass@local.core', 
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=bypass`, 
      provider: 'bypass' 
    });
  };

  const handleAutonomousOverride = () => {
    AuthService.enableAutonomousMode();
  };

  const validate = () => {
    const { email, password, confirmPassword, name } = formData;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid neural registry email address.");
      return false;
    }
    if (mode !== 'reset') {
      if (password.length < 8) {
        setError("Neural key must be at least 8 characters long for security.");
        return false;
      }
    }
    if (mode === 'signup') {
      if (!name) {
        setError("Operator designation (Name) is required.");
        return false;
      }
      if (password !== confirmPassword) {
        setError("Neural keys do not match. Verification failed.");
        return false;
      }
    }
    return true;
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await AuthService.signInWithGoogle();
      onLogin(user);
    } catch (err: any) {
      setError(err.message || "Cloud authentication relay failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (mode === 'signup') {
        const user = await AuthService.signUp(formData.name, formData.email, formData.password);
        onLogin(user);
      } else if (mode === 'login') {
        const user = await AuthService.login(formData.email, formData.password);
        onLogin(user);
      } else if (mode === 'reset') {
        await AuthService.resetPassword(formData.email);
        setSuccessMsg("Reset protocol transmitted. Monitor your registry inbox.");
      }
    } catch (err: any) {
      setError(err.message || "Internal auth link failure.");
    } finally {
      setIsLoading(false);
    }
  };

  const isDomainError = error?.includes('UNAUTHORIZED DOMAIN');

  return (
    <div className="fixed inset-0 z-[200] bg-[#050507] flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[180px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[150px] rounded-full" />
      </div>
      
      <div className="relative w-full max-w-[560px] py-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-zinc-900/40 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-10 md:p-14 shadow-[0_0_150px_rgba(0,0,0,0.9)] relative overflow-hidden">
          {/* Active Status Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 flex">
             <div className="flex-1 bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
             <div className="flex-1 bg-purple-600 shadow-[0_0_10px_rgba(147,51,234,0.5)]" />
             <div className="flex-1 bg-cyan-600 shadow-[0_0_10px_rgba(8,145,178,0.5)]" />
          </div>

          <div className="text-center mb-12">
            <div className="relative inline-flex mb-10 group">
              <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-3xl group-hover:bg-indigo-500/40 transition-all duration-500"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-indigo-600/20 ring-1 ring-white/20">K</div>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-3 font-['Space_Grotesk']">
              {mode === 'signup' ? 'Sync Identity' : mode === 'reset' ? 'Restore Link' : 'Neural Access'}
            </h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.6em] opacity-80">
              Koro-2 Autonomous Model v2.5
            </p>
          </div>

          <div className="space-y-8">
            {error && (
              <div className={`p-8 rounded-[2.5rem] flex flex-col space-y-6 animate-in shake-in duration-300 border-2 ${isDomainError ? 'bg-amber-500/10 border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.1)]' : 'bg-red-500/5 border-red-500/20'}`}>
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-2xl shrink-0 ${isDomainError ? 'bg-amber-500/20 text-amber-500' : 'bg-red-500/20 text-red-500'}`}>
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className={`text-[11px] font-black uppercase tracking-[0.2em] mb-3 flex items-center space-x-2 ${isDomainError ? 'text-amber-500' : 'text-red-500'}`}>
                      {isDomainError ? (
                        <>
                          <Globe className="w-3 h-3" />
                          <span>Domain Authorization Failure</span>
                        </>
                      ) : (
                        <span>Registry Protocol Error</span>
                      )}
                    </p>
                    <pre className={`text-[12px] font-bold leading-relaxed whitespace-pre-wrap font-sans ${isDomainError ? 'text-amber-100/90' : 'text-red-400'}`}>
                      {error}
                    </pre>
                  </div>
                </div>
                
                {isDomainError && (
                  <div className="flex flex-col space-y-3 pt-2">
                    <button 
                      onClick={handleAutonomousOverride}
                      className="w-full flex items-center justify-center space-x-3 py-5 bg-amber-500 hover:bg-amber-400 text-black rounded-[1.5rem] transition-all shadow-2xl shadow-amber-500/30 group font-black uppercase text-[11px] tracking-widest ring-1 ring-white/20"
                    >
                      <Cpu className="w-5 h-5 animate-pulse" />
                      <span>Engage Autonomous Engine Bypass</span>
                    </button>
                    <button 
                      onClick={() => setError(null)}
                      className="w-full py-4 bg-white/5 hover:bg-white/10 text-zinc-500 rounded-[1.2rem] transition-all text-[10px] font-black uppercase tracking-widest border border-white/5"
                    >
                      Dismiss System Alert
                    </button>
                  </div>
                )}
              </div>
            )}

            {!isDomainError && (
              <>
                {mode !== 'reset' && (
                  <button 
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center space-x-4 p-5 bg-white hover:bg-zinc-100 rounded-[1.8rem] transition-all shadow-2xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 ring-1 ring-black/5"
                  >
                    <GoogleLogo />
                    <span className="text-[12px] font-black text-black uppercase tracking-widest">Relay via Google</span>
                  </button>
                )}

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                  <span className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.5em] text-zinc-600">
                    <span className="bg-[#0b0b0d] px-6">Local Neural Registry</span>
                  </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {mode === 'signup' && (
                    <div className="relative group">
                      <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                      <input 
                        type="text" 
                        name="name"
                        placeholder="OPERATOR DESIGNATION" 
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-zinc-800/40 border border-white/5 rounded-[1.5rem] py-5 pl-16 pr-6 text-white text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-zinc-700 outline-none"
                        required
                      />
                    </div>
                  )}
                  
                  <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                    <input 
                      type="email" 
                      name="email"
                      placeholder="REGISTRY ADDRESS (EMAIL)" 
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-zinc-800/40 border border-white/5 rounded-[1.5rem] py-5 pl-16 pr-6 text-white text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-zinc-700 outline-none"
                      required
                    />
                  </div>

                  {mode !== 'reset' && (
                    <div className="space-y-5">
                      <div className="relative group">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                        <input 
                          type={showPassword ? "text" : "password"} 
                          name="password"
                          placeholder="NEURAL SYNC KEY" 
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full bg-zinc-800/40 border border-white/5 rounded-[1.5rem] py-5 pl-16 pr-14 text-white text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-zinc-700 outline-none"
                          required
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>

                      {mode === 'signup' && (
                        <div className="relative group">
                          <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                          <input 
                            type={showPassword ? "text" : "password"} 
                            name="confirmPassword"
                            placeholder="VERIFY SYNC KEY" 
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full bg-zinc-800/40 border border-white/5 rounded-[1.5rem] py-5 pl-16 pr-6 text-white text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-zinc-700 outline-none"
                            required
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="group w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-[1.8rem] flex items-center justify-center space-x-3 transition-all shadow-3xl shadow-indigo-600/30 active:scale-[0.98] disabled:opacity-50 mt-6"
                  >
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <span className="text-[11px] uppercase tracking-[0.5em]">
                          {mode === 'signup' ? 'Initiate Sync' : mode === 'reset' ? 'Request Recovery' : 'Authorize Core'}
                        </span>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            <div className="flex flex-col space-y-6 pt-6 text-center">
              <div className="flex items-center justify-center space-x-10">
                {mode === 'reset' ? (
                  <button 
                    type="button"
                    onClick={() => setMode('login')}
                    className="flex items-center space-x-3 text-[11px] text-zinc-500 font-black uppercase tracking-widest hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Registry</span>
                  </button>
                ) : (
                  <>
                    <button 
                      type="button"
                      onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}
                      className="text-[11px] text-zinc-500 font-black uppercase tracking-widest hover:text-white transition-colors"
                    >
                      {mode === 'login' ? 'New Identity? Sync' : 'Registered? Login'}
                    </button>
                    {mode === 'login' && (
                      <button 
                        type="button"
                        onClick={() => setMode('reset')}
                        className="text-[11px] text-zinc-500 font-black uppercase tracking-widest hover:text-indigo-400 transition-colors"
                      >
                        Reset Key
                      </button>
                    )}
                  </>
                )}
              </div>
              
              {!isDomainError && (
                <div className="pt-8 flex flex-col space-y-4 border-t border-white/5">
                  <button 
                    type="button"
                    onClick={handleBypass}
                    className="w-full flex items-center justify-center space-x-3 py-4 border border-indigo-500/10 bg-indigo-500/5 rounded-[1.5rem] text-[10px] font-black text-indigo-400/60 uppercase tracking-[0.4em] hover:bg-indigo-500/10 hover:text-indigo-300 transition-all group"
                  >
                    <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>Run in Local Bypass</span>
                  </button>
                  <button 
                    onClick={handleAutonomousOverride}
                    className="text-[9px] text-zinc-700 font-black uppercase tracking-[0.5em] hover:text-zinc-500 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Terminal className="w-3 h-3" />
                    <span>Force Autonomous Engine</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-10 flex flex-col items-center space-y-2 opacity-50">
          <p className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.8em]">
            Usama Neural Systems
          </p>
          <div className="h-px w-20 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
        </div>
      </div>
    </div>
  );
};
