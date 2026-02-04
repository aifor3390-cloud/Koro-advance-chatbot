
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatBox } from './components/ChatBox';
import { Header } from './components/Header';
import { UserInput } from './components/UserInput';
import { Auth } from './components/Auth';
import { Message, KoroState, ChatSession, Language, Theme, Attachment, User } from './types';
import { KORO_SPECS, INITIAL_MESSAGE, UI_STRINGS } from './constants';
import { generateKoroStream } from './services/koroEngine';
import { Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<KoroState>(() => {
    const saved = localStorage.getItem('koro_v2_store');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          isProcessing: false,
          sessions: parsed.sessions.map((s: any) => ({
            ...s,
            createdAt: new Date(s.createdAt),
            messages: s.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
          })),
          user: parsed.user || null
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
      user: null
    };
  });

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
        content || (attachments?.length ? "Analyze these attachments." : ""),
        [...currentSession.messages, userMsg],
        state.language,
        (text, chunks) => {
          setState(prev => ({
            ...prev,
            sessions: prev.sessions.map(s => {
              if (s.id === prev.currentSessionId) {
                const existingIndex = s.messages.findIndex(m => m.id === assistantMsgId);
                const assistantMsg: Message = { id: assistantMsgId, role: 'assistant', content: text, timestamp: new Date(), groundingChunks: chunks };
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
        console.error(e);
        const errorMsg: Message = { 
          id: (Date.now() + 5).toString(), 
          role: 'assistant', 
          content: "Neural Pathway Obstruction. Synchronization failed.", 
          timestamp: new Date() 
        };
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

  const handleLogout = () => {
    setState(prev => ({ ...prev, user: null }));
  };

  if (!state.user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-[#0b0b0d] text-slate-900 dark:text-zinc-100 overflow-hidden font-sans">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
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
        />
      </div>
      <main className="flex flex-col flex-1 h-full min-w-0 bg-white dark:bg-[#0b0b0d] relative">
        <div className="flex items-center px-4 lg:px-8 border-b border-zinc-200 dark:border-zinc-800/50 h-16 shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1 flex justify-center lg:justify-start">
             <Header 
                activeModel={state.activeModel} 
                author={state.author} 
                theme={state.theme}
                onToggleTheme={() => setState(p => ({...p, theme: p.theme === 'dark' ? 'light' : 'dark'}))}
                language={state.language}
                onSetLanguage={(l) => setState(p => ({...p, language: l}))}
                user={state.user}
                onLogout={handleLogout}
             />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto relative scroll-smooth pt-4">
           <div className="max-w-4xl mx-auto px-4 lg:px-6 w-full space-y-8 pb-10">
              {currentSession.messages.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4 animate-in">
                  <div className="w-16 h-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-500 mb-4">
                    <span className="text-3xl font-black">K</span>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">Multimodal Engine Active</h2>
                  <p className="text-zinc-500 max-w-sm">Welcome back, {state.user.name}. I can now analyze images, videos, and documents. Upload items to begin.</p>
                </div>
              )}
              {currentSession.messages.map((msg, i) => (
                <ChatBox key={msg.id} message={msg} theme={state.theme} />
              ))}
              {state.isProcessing && (
                <div className="flex items-center space-x-3 text-indigo-500 px-4 animate-pulse">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span className="text-xs font-bold uppercase tracking-widest">{t.thinking}</span>
                </div>
              )}
              <div ref={chatEndRef} className="h-4" />
           </div>
        </div>
        <div className="shrink-0 border-t border-zinc-200 dark:border-zinc-800/50 p-4 lg:p-8 bg-white/80 dark:bg-[#0b0b0d]/80 backdrop-blur-md">
          <div className="max-w-4xl mx-auto">
             <UserInput 
                onSend={handleSendMessage} 
                onStop={handleStopGeneration}
                disabled={state.isProcessing} 
                placeholder={t.inputPlaceholder} 
                language={state.language} 
             />
             <div className="mt-4 text-center">
                <p className="text-[10px] text-zinc-500 dark:text-zinc-600 font-medium uppercase tracking-[0.2em]">
                  {state.activeModel} • Platinum Series • {state.author} Systems
                </p>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
