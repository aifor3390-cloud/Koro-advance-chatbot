
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatBox } from './components/ChatBox';
import { Header } from './components/Header';
import { Message, KoroState, ChatSession, Language, Theme } from './types';
import { KORO_SPECS, INITIAL_MESSAGE, UI_STRINGS } from './constants';
import { generateKoroStream } from './services/koroEngine';

const App: React.FC = () => {
  const [state, setState] = useState<KoroState>(() => {
    const saved = localStorage.getItem('koro_state_v2');
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
          }))
        };
      } catch (e) { console.error(e); }
    }

    const initialId = Date.now().toString();
    return {
      isProcessing: false,
      sessions: [{
        id: initialId,
        title: "First Initialization",
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
      language: 'en'
    };
  });

  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const currentSession = useMemo(() => 
    state.sessions.find(s => s.id === state.currentSessionId) || state.sessions[0],
    [state.sessions, state.currentSessionId]
  );

  const t = UI_STRINGS[state.language];

  useEffect(() => {
    localStorage.setItem('koro_state_v2', JSON.stringify(state));
    if (state.theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [state]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    chatEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Initial scroll and scroll on session change
  useEffect(() => {
    scrollToBottom('auto');
  }, [state.currentSessionId, scrollToBottom]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || state.isProcessing) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content, timestamp: new Date() };
    const assistantMsgId = (Date.now() + 1).toString();
    
    // Update session with user message and potentially update title
    const updatedSessions = state.sessions.map(s => {
      if (s.id === state.currentSessionId) {
        const newTitle = s.messages.length <= 1 ? content.slice(0, 35) : s.title;
        return { ...s, messages: [...s.messages, userMsg], title: newTitle };
      }
      return s;
    });

    setState(prev => ({ ...prev, sessions: updatedSessions, isProcessing: true }));
    setTimeout(() => scrollToBottom(), 50);

    try {
      let currentResponseText = "";
      
      await generateKoroStream(
        content, 
        currentSession.messages.concat(userMsg), 
        state.language,
        (textChunk) => {
          currentResponseText = textChunk;
          setState(prev => ({
            ...prev,
            sessions: prev.sessions.map(s => {
              if (s.id === prev.currentSessionId) {
                const existingAssistantMsgIndex = s.messages.findIndex(m => m.id === assistantMsgId);
                const assistantMsg: Message = {
                  id: assistantMsgId,
                  role: 'assistant',
                  content: currentResponseText,
                  timestamp: new Date()
                };

                if (existingAssistantMsgIndex >= 0) {
                  const newMsgs = [...s.messages];
                  newMsgs[existingAssistantMsgIndex] = assistantMsg;
                  return { ...s, messages: newMsgs };
                } else {
                  return { ...s, messages: [...s.messages, assistantMsg] };
                }
              }
              return s;
            })
          }));
          // Fast scroll during streaming to keep user at the bottom
          scrollToBottom('auto');
        }
      );

      setState(prev => ({ ...prev, isProcessing: false }));
    } catch (error) {
      console.error(error);
      const errorMsg: Message = { 
        id: (Date.now() + 5).toString(), 
        role: 'assistant', 
        content: "Neural Pathway Obstruction. Synchronization failed.", 
        timestamp: new Date() 
      };
      setState(prev => ({
        ...prev,
        isProcessing: false,
        sessions: prev.sessions.map(s => {
          if (s.id === state.currentSessionId) return { ...s, messages: [...s.messages, errorMsg] };
          return s;
        })
      }));
    }
  };

  const createNewChat = () => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: "New Stream",
      messages: [{ id: '1', role: 'assistant', content: INITIAL_MESSAGE[state.language], timestamp: new Date() }],
      createdAt: new Date()
    };
    setState(prev => ({ ...prev, sessions: [newSession, ...prev.sessions], currentSessionId: newId }));
  };

  const selectSession = (id: string) => setState(prev => ({ ...prev, currentSessionId: id }));
  const deleteSession = (id: string) => setState(prev => {
    const filtered = prev.sessions.filter(s => s.id !== id);
    if (filtered.length === 0) {
      const newId = Date.now().toString();
      return { ...prev, sessions: [{ id: newId, title: "Initial Contact", messages: [], createdAt: new Date() }], currentSessionId: newId };
    }
    return { ...prev, sessions: filtered, currentSessionId: filtered[0].id };
  });

  const toggleTheme = () => setState(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  const setLanguage = (lang: Language) => setState(prev => ({ ...prev, language: lang }));

  return (
    <div className={`flex h-screen w-full transition-colors duration-1000 ease-in-out ${state.theme === 'dark' ? 'bg-[#050507] text-zinc-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow animation-delay-1000"></div>

      <Sidebar 
        specs={KORO_SPECS} 
        sessions={state.sessions} 
        currentId={state.currentSessionId}
        onSelect={selectSession}
        onDelete={deleteSession}
        onNew={createNewChat}
        language={state.language}
        searchTerm={historySearchTerm}
        onSearch={setHistorySearchTerm}
      />
      
      <main className="flex flex-col flex-1 relative min-w-0 z-10">
        <Header 
          activeModel={state.activeModel} 
          author={state.author} 
          theme={state.theme}
          onToggleTheme={toggleTheme}
          language={state.language}
          onSetLanguage={setLanguage}
        />
        
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 md:px-12 py-8 space-y-8 scroll-smooth scrollbar-thin">
          <div className="max-w-4xl mx-auto space-y-12">
            {currentSession.messages.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-8 animate-in fade-in zoom-in duration-1000">
                <div className="relative group perspective-2000">
                  <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-[60px] animate-pulse"></div>
                  <div className="w-20 h-20 bg-indigo-600/20 rounded-3xl flex items-center justify-center animate-float shadow-2xl">
                    <span className="text-4xl font-black text-indigo-500">K</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight uppercase bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Koro AI Engine Ready</h2>
                  <p className="text-zinc-500 mt-3 max-w-sm mx-auto font-medium">Proprietary neural architecture by {state.author}. Experience high-performance intelligence.</p>
                </div>
              </div>
            )}
            
            {currentSession.messages.map((msg, index) => (
              <ChatBox key={msg.id} message={msg} theme={state.theme} isNew={index === currentSession.messages.length - 1 && msg.role === 'user'} />
            ))}
            
            {state.isProcessing && !currentSession.messages.some(m => m.role === 'assistant' && m.id === (parseInt(currentSession.messages[currentSession.messages.length - 1].id) + 1).toString()) && (
              <div className="flex items-center space-x-4 text-indigo-500 animate-in fade-in slide-in-from-left-4 bg-indigo-500/5 p-6 rounded-3xl border border-indigo-500/20 max-w-fit shadow-lg shadow-indigo-500/5">
                <div className="relative">
                  <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                </div>
                <div>
                  <p className="text-sm font-black tracking-widest uppercase">{t.thinking}</p>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Neural Synchronizing...</p>
                </div>
              </div>
            )}
            <div ref={chatEndRef} className="h-20" />
          </div>
        </div>

        <div className="p-4 md:p-12 relative">
          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-50 dark:from-[#050507] to-transparent pointer-events-none -translate-y-full"></div>
          <div className="max-w-4xl mx-auto">
            <UserInput onSend={handleSendMessage} disabled={state.isProcessing} placeholder={t.inputPlaceholder} language={state.language} />
            <div className="flex justify-between items-center mt-6 px-4">
              <span className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.3em]">{state.activeModel} 2.5 PLATINUM</span>
              <span className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.3em]">{state.author} SYSTEMS</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const UserInput: React.FC<{ onSend: (t: string) => void; disabled: boolean; placeholder: string, language: Language }> = ({ onSend, disabled, placeholder, language }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !disabled) { 
      onSend(input); 
      setInput(''); 
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      // Map app language to standard BCP 47 language tags
      const langMap: Record<Language, string> = {
        en: 'en-US',
        es: 'es-ES',
        fr: 'fr-FR',
        ur: 'ur-PK',
        ar: 'ar-SA'
      };
      
      recognitionRef.current.lang = langMap[language] || 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        if (transcript) {
          setInput(prev => (prev.trim() ? prev + ' ' + transcript : transcript));
        }
      };

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
    } else {
        // Update language if it changed
        const langMap: Record<Language, string> = {
            en: 'en-US',
            es: 'es-ES',
            fr: 'fr-FR',
            ur: 'ur-PK',
            ar: 'ar-SA'
        };
        recognitionRef.current.lang = langMap[language] || 'en-US';
    }

    recognitionRef.current.start();
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <form onSubmit={handleSubmit} className="relative group transition-all duration-500">
      <div className={`absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-500 rounded-[2.5rem] blur-xl transition-all duration-700 ${isListening ? 'opacity-40 animate-pulse' : 'opacity-0 group-focus-within:opacity-20'}`}></div>
      <div className="relative flex items-end bg-white dark:bg-zinc-900/80 glass rounded-[2rem] p-3 shadow-2xl shadow-indigo-500/10 border border-zinc-200 dark:border-zinc-800 focus-within:border-indigo-500/50 transition-colors">
        <button
          type="button"
          onClick={toggleMic}
          disabled={disabled}
          title="Toggle Voice Input"
          className={`mb-1 ml-1 w-14 h-14 flex items-center justify-center rounded-[1.5rem] transition-all transform active:scale-95 border ${isListening ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse' : 'bg-zinc-100 dark:bg-zinc-800 border-transparent text-zinc-400 hover:text-indigo-500 hover:bg-indigo-500/10'}`}
        >
          {isListening ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><circle cx="12" cy="12" r="10" className="opacity-20"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
          )}
        </button>
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening... Speak now." : placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent border-0 py-4 px-6 focus:outline-none focus:ring-0 resize-none text-slate-800 dark:text-zinc-100 max-h-48 scrollbar-hide text-lg"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="mb-1 mr-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:opacity-50 text-white w-14 h-14 flex items-center justify-center rounded-[1.5rem] transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-indigo-600/30"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
        </button>
      </div>
    </form>
  );
};

export default App;
