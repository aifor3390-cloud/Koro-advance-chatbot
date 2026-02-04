
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatBox } from './components/ChatBox';
import { Header } from './components/Header';
import { UserInput } from './components/UserInput';
import { Auth } from './components/Auth';
import { ProfileModal } from './components/ProfileModal';
import { InitDashboard } from './components/InitDashboard';
import { Message, KoroState, ChatSession, Language, Attachment, User } from './types';
import { KORO_SPECS, INITIAL_MESSAGE, UI_STRINGS } from './constants';
import { generateKoroStream } from './services/koroEngine';
import { auth, onAuthStateChanged, isMock } from './services/firebase';
import { AuthService } from './services/authService';
import { Menu, Loader2, Settings, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isInitDashboardOpen, setIsInitDashboardOpen] = useState(false);

  const [state, setState] = useState<KoroState>(() => {
    const saved = localStorage.getItem('koro_v2_store');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          isProcessing: false,
          isInitialized: parsed.isInitialized ?? false,
          systemLogs: parsed.systemLogs || [],
          sessions: parsed.sessions.map((s: any) => ({
            ...s,
            createdAt: new Date(s.createdAt),
            messages: s.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
          })),
          user: null 
        };
      } catch (e) { console.error("Restore failed", e); }
    }

    const initialId = Date.now().toString();
    return {
      isProcessing: false,
      sessions: [{
        id: initialId,
        title: "New Objective",
        messages: [{
          id: '1',
          role: 'assistant',
          content: INITIAL_MESSAGE.en,
          timestamp: new Date()
        }],
        createdAt: new Date()
      }],
      currentSessionId: initialId,
      activeModel: KORO_SPECS.name,
      author: KORO_SPECS.author,
      theme: 'dark',
      language: 'en',
      user: null,
      isInitialized: false,
      systemLogs: []
    };
  });

  const isAutonomous = !process.env.API_KEY || process.env.API_KEY.includes("YOUR_");

  useEffect(() => {
    if (isMock) {
      const localUser = (AuthService as any)._getMockUser();
      if (localUser) {
        const saved = localStorage.getItem('koro_v2_user_override');
        if (saved) {
          const override = JSON.parse(saved);
          setState(prev => ({ ...prev, user: { ...localUser, ...override } }));
        } else {
          setState(prev => ({ ...prev, user: localUser }));
        }
      }
      setIsInitializing(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const saved = localStorage.getItem('koro_v2_user_override');
        let override = null;
        if (saved) override = JSON.parse(saved);

        const user: User = {
          id: firebaseUser.uid,
          name: override?.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "Operator",
          email: firebaseUser.email || "",
          avatar: override?.avatar || firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.email}`,
          provider: 'email'
        };
        setState(prev => ({ ...prev, user }));
      } else {
        setState(prev => ({ ...prev, user: null }));
      }
      setIsInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const currentSession = state.sessions.find(s => s.id === state.currentSessionId) || state.sessions[0];
  const t = UI_STRINGS[state.language];

  useEffect(() => {
    localStorage.setItem('koro_v2_store', JSON.stringify(state));
    if (state.theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [state]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    chatEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    scrollToBottom('auto');
  }, [state.currentSessionId, scrollToBottom]);

  const handleStopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, []);

  const handleSendMessage = async (content: string, attachments?: Attachment[]) => {
    if ((!content.trim() && (!attachments || attachments.length === 0)) || state.isProcessing) return;

    abortControllerRef.current = new AbortController();

    const userMsg: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      content, 
      timestamp: new Date(),
      attachments 
    };
    const assistantMsgId = (Date.now() + 1).toString();
    
    setState(prev => ({
      ...prev,
      isProcessing: true,
      sessions: prev.sessions.map(s => 
        s.id === prev.currentSessionId 
          ? { 
              ...s, 
              messages: [...s.messages, userMsg], 
              title: s.messages.length <= 1 ? (content.slice(0, 30) || (attachments?.length ? `Analysis of ${attachments.length} items` : "New Chat")) : s.title 
            }
          : s
      )
    }));

    setTimeout(() => scrollToBottom(), 50);

    try {
      await generateKoroStream(
        content || (attachments?.length ? "Analyze." : ""),
        [...currentSession.messages, userMsg],
        state.language,
        (text, thoughts, chunks) => {
          setState(prev => ({
            ...prev,
            sessions: prev.sessions.map(s => {
              if (s.id === prev.currentSessionId) {
                const existingIndex = s.messages.findIndex(m => m.id === assistantMsgId);
                const assistantMsg: Message = { 
                  id: assistantMsgId, 
                  role: 'assistant', 
                  content: text, 
                  timestamp: new Date(), 
                  groundingChunks: chunks,
                  thoughtProcess: thoughts,
                  isThinking: text === ""
                };
                if (existingIndex >= 0) {
                  const newMsgs = [...s.messages];
                  newMsgs[existingIndex] = assistantMsg;
                  return { ...s, messages: newMsgs };
                }
                return { ...s, messages: [...s.messages, assistantMsg] };
              }
              return s;
            })
          }));
          scrollToBottom('auto');
        },
        attachments,
        abortControllerRef.current.signal
      );
    } catch (e) {
      if (!(e instanceof Error && e.name === 'AbortError')) {
        const errorMsg: Message = { id: (Date.now() + 5).toString(), role: 'assistant', content: "Neural Pathway Obstruction. Synchronization failed.", timestamp: new Date() };
        setState(prev => ({
          ...prev,
          sessions: prev.sessions.map(s => s.id === prev.currentSessionId ? { ...s, messages: [...s.messages, errorMsg] } : s)
        }));
      }
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
      abortControllerRef.current = null;
    }
  };

  const createNewChat = () => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: "New Synchronization",
      messages: [{ id: '1', role: 'assistant', content: INITIAL_MESSAGE[state.language], timestamp: new Date() }],
      createdAt: new Date()
    };
    setState(prev => ({ ...prev, sessions: [newSession, ...prev.sessions], currentSessionId: newId }));
    setIsSidebarOpen(false);
  };

  const deleteSession = (id: string) => {
    setState(prev => {
      const filtered = prev.sessions.filter(s => s.id !== id);
      const nextId = filtered.length > 0 ? filtered[0].id : Date.now().toString();
      const finalSessions = filtered.length > 0 ? filtered : [{ id: nextId, title: "Initial Contact", messages: [], createdAt: new Date() }];
      return { ...prev, sessions: finalSessions, currentSessionId: nextId };
    });
  };

  const handleLogin = (user: User) => {
    setState(prev => ({ ...prev, user }));
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      localStorage.removeItem('koro_v2_user_override');
      setState(prev => ({ ...prev, user: null }));
    } catch (e) { console.error("Logout failed", e); }
  };

  const handleUpdateUser = (updatedUser: User) => {
    setState(prev => ({ ...prev, user: updatedUser }));
    localStorage.setItem('koro_v2_user_override', JSON.stringify({ name: updatedUser.name, avatar: updatedUser.avatar }));
  };

  const handleInitComplete = () => {
    setState(prev => ({ ...prev, isInitialized: true }));
  };

  if (isInitializing) {
    return (
      <div className="fixed inset-0 bg-[#050507] flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl mb-4 animate-pulse">K</div>
        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
        <p className="mt-4 text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em]">Initializing Neural Core...</p>
      </div>
    );
  }

  if (!state.user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-[#0b0b0d] text-slate-900 dark:text-zinc-100 overflow-hidden font-sans">
      <div className={`
        fixed lg:relative z-50 h-full w-[300px] transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar 
          specs={KORO_SPECS} 
          sessions={state.sessions} 
          currentId={state.currentSessionId}
          onSelect={(id) => { setState(p => ({...p, currentSessionId: id})); setIsSidebarOpen(false); }}
          onDelete={deleteSession}
          onNew={createNewChat}
          language={state.language}
          searchTerm=""
          onSearch={() => {}}
          isInitialized={state.isInitialized}
        />
        <button 
          onClick={() => setIsInitDashboardOpen(true)}
          className="absolute bottom-6 right-6 lg:static lg:mt-4 mx-4 p-4 bg-zinc-900 border border-white/5 rounded-2xl text-zinc-400 hover:text-white transition-all flex items-center space-x-3 group"
        >
          <Settings className={`w-4 h-4 ${!state.isInitialized ? 'text-amber-500 animate-pulse' : ''}`} />
          <span className="text-[10px] font-black uppercase tracking-widest">System Init</span>
        </button>
      </div>
      <main className="flex flex-col flex-1 h-full min-w-0 bg-white dark:bg-[#0b0b0d] relative">
        <div className="flex items-center px-4 lg:px-8 border-b border-zinc-200 dark:border-zinc-800/50 h-16 shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-zinc-500 rounded-lg">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1">
             <Header 
                activeModel={isAutonomous ? "Koro-2 Synthesis" : state.activeModel} 
                author={state.author} 
                theme={state.theme}
                onToggleTheme={() => setState(p => ({...p, theme: p.theme === 'dark' ? 'light' : 'dark'}))}
                language={state.language}
                onSetLanguage={(l) => setState(p => ({...p, language: l}))}
                user={state.user}
                onLogout={handleLogout}
                onOpenProfile={() => setIsProfileOpen(true)}
             />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto relative scroll-smooth pt-4">
           {isAutonomous && (
             <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center space-x-2 animate-in fade-in zoom-in duration-500">
               <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
               <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Synthesis Mode Active</span>
             </div>
           )}
           {!state.isInitialized && (
             <div className="m-8 p-6 bg-amber-500/10 border border-amber-500/20 rounded-3xl flex items-center justify-between">
                <div className="flex items-center space-x-4">
                   <AlertCircle className="w-6 h-6 text-amber-500" />
                   <div>
                      <p className="text-sm font-bold text-amber-500 uppercase tracking-tight">System Uninitialized</p>
                      <p className="text-xs text-amber-500/70">Project configuration required for peak autonomous performance.</p>
                   </div>
                </div>
                <button 
                  onClick={() => setIsInitDashboardOpen(true)}
                  className="px-4 py-2 bg-amber-500 text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:scale-105 transition-transform"
                >
                  Init Project
                </button>
             </div>
           )}
           <div className="max-w-4xl mx-auto px-4 lg:px-6 w-full space-y-8 pb-10">
              {currentSession.messages.map((msg) => (
                <ChatBox key={msg.id} message={msg} theme={state.theme} />
              ))}
              {state.isProcessing && (
                <div className="flex items-center space-x-3 text-indigo-500 px-4 animate-pulse">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span className="text-xs font-bold uppercase tracking-widest">Synthesizing Neural Logic...</span>
                </div>
              )}
              <div ref={chatEndRef} className="h-4" />
           </div>
        </div>
        <div className="shrink-0 border-t border-zinc-200 dark:border-zinc-800/50 p-4 lg:p-8 bg-white/80 dark:bg-[#0b0b0d]/80 backdrop-blur-md">
          <div className="max-w-4xl mx-auto">
             <UserInput onSend={handleSendMessage} onStop={handleStopGeneration} disabled={state.isProcessing} placeholder={t.inputPlaceholder} language={state.language} />
             <div className="mt-4 text-center">
                <p className="text-[10px] text-zinc-500 dark:text-zinc-600 font-medium uppercase tracking-[0.2em]">
                  {isAutonomous ? "Koro-2 Autonomous Model • Zero-API Bypass • Developed by Usama" : `${state.activeModel} • Platinum Series • ${state.author} Systems`}
                </p>
             </div>
          </div>
        </div>
      </main>

      {isProfileOpen && state.user && (
        <ProfileModal user={state.user} onClose={() => setIsProfileOpen(false)} onSave={handleUpdateUser} />
      )}

      {isInitDashboardOpen && (
        <InitDashboard 
          isInitialized={state.isInitialized} 
          onInitComplete={handleInitComplete} 
          onClose={() => setIsInitDashboardOpen(false)} 
        />
      )}
    </div>
  );
};

export default App;
