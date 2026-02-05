
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatBox } from './components/ChatBox';
import { Header } from './components/Header';
import { UserInput } from './components/UserInput';
import { SettingsModal } from './components/SettingsModal';
import { ProfileModal } from './components/ProfileModal';
import { ScriptWorkshop } from './components/ScriptWorkshop';
import { AvatarWorkshop } from './components/AvatarWorkshop';
import { Message, KoroState, ChatSession, Language, Attachment } from './types';
import { KORO_SPECS, INITIAL_MESSAGE, UI_STRINGS } from './constants';
import { generateKoroStream } from './services/koroEngine';
import { MemoryService } from './services/memoryService';
import { Menu, Cpu, Bolt, Brain, Search } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<KoroState>(() => {
    const saved = localStorage.getItem('koro_v3_store');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const lang = parsed.language || 'en';
        return {
          ...parsed,
          isProcessing: false,
          theme: parsed.theme || 'dark',
          language: lang,
          user: parsed.user || { name: 'Platinum Operator', avatar: '' },
          sessions: (parsed.sessions || []).map((s: any) => ({
            ...s,
            createdAt: new Date(s.createdAt),
            messages: (s.messages || []).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
          }))
        };
      } catch (e) { 
        console.error("Neural state restoration failed, reverting to defaults", e); 
      }
    }

    const initialId = Date.now().toString();
    const defaultLang = 'en';
    return {
      isProcessing: false,
      sessions: [{
        id: initialId,
        title: "Initial Synchrony",
        messages: [{ id: '1', role: 'assistant', content: INITIAL_MESSAGE[defaultLang], timestamp: new Date() }],
        createdAt: new Date()
      }],
      currentSessionId: initialId,
      activeModel: KORO_SPECS.name,
      author: KORO_SPECS.author,
      theme: 'dark',
      language: defaultLang,
      user: { name: 'Platinum Operator', avatar: '' }
    };
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScriptWorkshopOpen, setIsScriptWorkshopOpen] = useState(false);
  const [isAvatarLabOpen, setIsAvatarLabOpen] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const currentSession = state.sessions.find(s => s.id === state.currentSessionId) || state.sessions[0];
  const t = UI_STRINGS[state.language];

  useEffect(() => {
    localStorage.setItem('koro_v3_store', JSON.stringify(state));
    const isDark = state.theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.body.className = isDark ? 'bg-[#050507] text-zinc-100' : 'bg-slate-50 text-slate-900';
    const isRTL = state.language === 'ar' || state.language === 'ur';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = state.language;
  }, [state]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    chatEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => scrollToBottom('auto'), [state.currentSessionId, scrollToBottom]);

  const handleUpdateMessage = (updatedMsg: Message) => {
    setState(prev => ({
      ...prev,
      sessions: prev.sessions.map(s => {
        if (s.id === prev.currentSessionId) {
          return {
            ...s,
            messages: s.messages.map(m => m.id === updatedMsg.id ? updatedMsg : m)
          };
        }
        return s;
      })
    }));
  };

  const handleSendMessage = async (content: string, attachments?: Attachment[], isSearchMode: boolean = false) => {
    if ((!content.trim() && !attachments?.length) || state.isProcessing) return;

    abortControllerRef.current = new AbortController();
    
    const isScriptMode = content.startsWith('[NEURAL_SCRIPT_DIRECTIVE]:');
    const finalContent = isSearchMode ? `[NEURAL_SEARCH_DIRECTIVE]: ${content}` : content;

    const userMsg: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: isScriptMode 
        ? `🎬 Generating Cinematic Strategy...` 
        : (isSearchMode ? `🔍 Neural Search: ${content}` : content), 
      timestamp: new Date(), 
      attachments 
    };
    
    const assistantMsgId = (Date.now() + 1).toString();
    
    setState(prev => ({
      ...prev,
      isProcessing: true,
      sessions: prev.sessions.map(s => 
        s.id === prev.currentSessionId 
          ? { ...s, messages: [...s.messages, userMsg], title: s.messages.length <= 1 ? (content.slice(0, 30) || "Omni Sync") : s.title }
          : s
      )
    }));

    setTimeout(() => scrollToBottom(), 50);

    try {
      const result = await generateKoroStream(
        finalContent,
        [...currentSession.messages, userMsg],
        state.language,
        (text, thoughts, chunks, characters, image) => {
          setState(prev => ({
            ...prev,
            sessions: prev.sessions.map(s => {
              if (s.id === prev.currentSessionId) {
                const assistantMsg: Message = { 
                  id: assistantMsgId, role: 'assistant', content: text, timestamp: new Date(), 
                  groundingChunks: chunks, thoughtProcess: thoughts, isThinking: text === "",
                  characters: characters,
                  attachments: image ? [{
                    id: 'gen-' + Date.now(),
                    type: 'image',
                    data: image,
                    mimeType: 'image/png',
                    name: 'Neural_Synthesis.png'
                  }] : []
                };
                const existingIndex = s.messages.findIndex(m => m.id === assistantMsgId);
                const newMsgs = [...s.messages];
                if (existingIndex >= 0) newMsgs[existingIndex] = assistantMsg;
                else newMsgs.push(assistantMsg);
                return { ...s, messages: newMsgs };
              }
              return s;
            })
          }));
          scrollToBottom('auto');
        },
        attachments,
        abortControllerRef.current.signal
      );

      // Final state sync for images returned at the end of the generator
      if (result.generatedImage) {
        setState(prev => ({
          ...prev,
          sessions: prev.sessions.map(s => {
            if (s.id === prev.currentSessionId) {
              return {
                ...s,
                messages: s.messages.map(m => {
                  if (m.id === assistantMsgId) {
                    return {
                      ...m,
                      attachments: [{
                        id: 'gen-' + Date.now(),
                        type: 'image',
                        data: result.generatedImage!,
                        mimeType: 'image/png',
                        name: 'Neural_Synthesis_Final.png'
                      }]
                    };
                  }
                  return m;
                })
              };
            }
            return s;
          })
        }));
      }

    } catch (e) {
      if (!(e instanceof Error && e.name === 'AbortError')) {
        const errId = Date.now().toString();
        setState(prev => ({
          ...prev,
          sessions: prev.sessions.map(s => s.id === prev.currentSessionId ? { ...s, messages: [...s.messages, { id: errId, role: 'assistant', content: "Neural sync interruption. Re-engaging...", timestamp: new Date() }] } : s)
        }));
      }
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
      abortControllerRef.current = null;
    }
  };

  const createNewChat = () => {
    const newId = Date.now().toString();
    setState(prev => ({
      ...prev,
      sessions: [{ id: newId, title: "New Sync", messages: [{ id: '1', role: 'assistant', content: INITIAL_MESSAGE[state.language], timestamp: new Date() }], createdAt: new Date() }, ...prev.sessions],
      currentSessionId: newId
    }));
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-[#050507] text-slate-900 dark:text-zinc-100 overflow-hidden font-sans transition-colors duration-300">
      <div className={`fixed lg:relative z-50 h-full w-[300px] transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : (state.language === 'ar' || state.language === 'ur' ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0')}`}>
        <Sidebar 
          specs={KORO_SPECS} sessions={state.sessions} currentId={state.currentSessionId} 
          onSelect={(id) => { setState(p => ({...p, currentSessionId: id})); setIsSidebarOpen(false); }} 
          onDelete={(id) => setState(p => { const filtered = p.sessions.filter(s => s.id !== id); return { ...p, sessions: filtered.length ? filtered : p.sessions, currentSessionId: filtered.length ? filtered[0].id : p.currentSessionId }; })} 
          onNew={createNewChat} onOpenProfile={() => setIsProfileOpen(true)} onOpenScriptWorkshop={() => setIsScriptWorkshopOpen(true)}
          onOpenAvatarLab={() => setIsAvatarLabOpen(true)} language={state.language} user={state.user} 
        />
      </div>
      
      {isSidebarOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <main className="flex flex-col flex-1 h-full min-w-0 bg-white dark:bg-[#0b0b0d] relative transition-colors duration-300">
        <div className="flex items-center px-4 lg:px-8 border-b border-zinc-200 dark:border-zinc-800/50 h-16 shrink-0 bg-white dark:bg-[#0b0b0d]/50 backdrop-blur-md z-10">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -mx-2 text-zinc-500 hover:text-indigo-600 rounded-lg"><Menu className="w-6 h-6" /></button>
          <div className="flex-1 h-full">
             <Header activeModel="Koro-3 Platinum Neural Core" author={state.author} theme={state.theme} onToggleTheme={() => setState(p => ({...p, theme: p.theme === 'dark' ? 'light' : 'dark'}))} language={state.language} onSetLanguage={(l) => setState(p => ({...p, language: l}))} onSearch={(query) => handleSendMessage(query, undefined, true)} onOpenSettings={() => setIsSettingsOpen(true)} isSearching={state.isProcessing} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto relative pt-4 bg-slate-50 dark:bg-[#050507] transition-colors duration-300 no-scrollbar">
           <div className={`absolute top-4 ${state.language === 'ar' || state.language === 'ur' ? 'left-4' : 'right-4'} z-10 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center space-x-2`}>
             <Brain className="w-3 h-3 text-indigo-500 animate-pulse" />
             <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Neural Sync Active</span>
           </div>
           <div className="max-w-4xl mx-auto px-4 lg:px-6 w-full space-y-8 pb-10">
              {currentSession.messages.map((msg) => ( <ChatBox key={msg.id} message={msg} theme={state.theme} onUpdateMessage={handleUpdateMessage} /> ))}
              {state.isProcessing && (
                <div className="flex items-center space-x-3 text-indigo-500 px-4 animate-pulse">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span className="text-xs font-bold uppercase tracking-widest">Streaming Neural Logic...</span>
                </div>
              )}
              <div ref={chatEndRef} className="h-4" />
           </div>
        </div>
        <div className="shrink-0 border-t border-zinc-200 dark:border-zinc-800/50 p-4 lg:p-8 bg-white/80 dark:bg-[#0b0b0d]/80 backdrop-blur-md">
          <div className="max-w-4xl mx-auto">
             <UserInput onSend={handleSendMessage} onStop={() => abortControllerRef.current?.abort()} disabled={state.isProcessing} placeholder={t.inputPlaceholder} language={state.language} />
             <div className="mt-4 text-center">
                <p className="text-[10px] text-zinc-400 dark:text-zinc-600 font-medium uppercase tracking-[0.2em]">Koro-3 Platinum • Autonomous Multimodal Analysis • Character Lab Online</p>
             </div>
          </div>
        </div>
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} theme={state.theme} onToggleTheme={() => setState(p => ({...p, theme: p.theme === 'dark' ? 'light' : 'dark'}))} language={state.language} onSetLanguage={(l) => setState(p => ({...p, language: l}))} specs={KORO_SPECS} />
      {isProfileOpen && <ProfileModal user={state.user} onClose={() => setIsProfileOpen(false)} onSave={(u) => setState(p => ({...p, user: {...p.user, ...u}}))} onOpenAvatarWorkshop={() => { setIsProfileOpen(false); setIsAvatarLabOpen(true); }} />}
      <ScriptWorkshop isOpen={isScriptWorkshopOpen} onClose={() => setIsScriptWorkshopOpen(false)} onGenerate={(p) => handleSendMessage(p)} />
      <AvatarWorkshop isOpen={isAvatarLabOpen} onClose={() => setIsAvatarLabOpen(false)} onApply={(a) => { setState(p => ({...p, user: {...p.user, avatar: a}})); setIsAvatarLabOpen(false); }} />
    </div>
  );
};

export default App;
