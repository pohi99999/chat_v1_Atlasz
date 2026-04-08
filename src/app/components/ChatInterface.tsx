"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import profile from '../../config/profile.json';

// --- Típusok ---
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  time?: string;
}

interface ThreadSummary {
  id: string;
  title: string;
  created_at: string;
}

interface DocumentInfo {
  source: string;
  count: number;
}

// Browser Speech types
interface ISpeechRecognitionEvent {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}
interface ISpeechRecognition {
  lang: string;
  continuous: boolean;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
}
interface ISpeechRecognitionConstructor {
  new (): ISpeechRecognition;
}
interface IWindow extends Window {
  webkitSpeechRecognition?: ISpeechRecognitionConstructor;
  SpeechRecognition?: ISpeechRecognitionConstructor;
}

function now(): string {
  return new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
}

// --- Komponensek ---

function KnowledgeModal({ onClose }: { onClose: () => void }) {
  const [docs, setDocs] = useState<DocumentInfo[]>([]);
  const [totalChunks, setTotalChunks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      if (data.documents) {
        setDocs(data.documents);
        setTotalChunks(data.totalChunks ?? 0);
      }
    } catch {
      // csendes hiba
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('Biztosan törlöd az összes feltöltött dokumentumot?')) return;
    setDeleting(true);
    try {
      await fetch('/api/documents', { method: 'DELETE' });
      setDocs([]);
      setTotalChunks(0);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-900">📚 Tudásbázis Kezelő</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">✕</button>
        </div>
        <p className="text-xs text-slate-400 mb-4">{totalChunks} szövegrészlet indexelve</p>
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
          {loading ? (
            <p className="text-sm text-slate-400 text-center py-8">Betöltés...</p>
          ) : docs.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-sm text-slate-400">Még nincs feltöltött dokumentum.<br/>Használd a 📎 gombot fájl hozzáadásához.</p>
            </div>
          ) : (
            docs.map((doc) => (
              <div key={doc.source} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-slate-700 truncate max-w-[280px]">{doc.source}</p>
                  <p className="text-xs text-slate-400">{doc.count} részlet · {doc.lastAdded ? new Date(doc.lastAdded).toLocaleDateString('hu-HU') : ''}</p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{doc.count}</span>
              </div>
            ))
          )}
        </div>
        <div className="flex gap-3 mt-6">
          {docs.length > 0 && (
            <button
              onClick={handleDeleteAll}
              disabled={deleting}
              className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
            >
              {deleting ? 'Törlés...' : 'Összes törlése'}
            </button>
          )}
          <button onClick={onClose} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium text-sm">Bezárás</button>
        </div>
      </div>
    </div>
  );
}

export default function ChatInterface() {
  // State
  const [currentThreadId, setCurrentThreadId] = useState<string>(crypto.randomUUID());
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    { id: crypto.randomUUID(), role: "assistant", content: profile.greeting, time: now() }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isKnowledgeOpen, setIsKnowledgeOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Desktopon alapértelmezett

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load threads on init
  useEffect(() => {
    const fetchThreads = async () => {
      const res = await fetch('/api/threads');
      const data = await res.json();
      if (data.threads) setThreads(data.threads);
    };
    fetchThreads();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Textarea auto-grow
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 150) + 'px';
  }, [input]);

  // Actions
  const createNewChat = () => {
    setCurrentThreadId(crypto.randomUUID());
    setMessages([{ id: crypto.randomUUID(), role: "assistant", content: profile.greeting, time: now() }]);
    setInput("");
  };

  const loadThread = async (id: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/threads/${id}`);
      const data = await res.json();
      if (data.thread) {
        setCurrentThreadId(data.thread.id);
        setMessages(data.thread.messages);
      }
      setIsLoading(false);
      // Mobilon bezárjuk a sidebar-t betöltés után
      if (window.innerWidth < 768) setIsSidebarOpen(false);
    } catch {
      setIsLoading(false);
    }
  };

  const deleteThread = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Biztosan törlöd ezt a beszélgetést?")) return;
    await fetch(`/api/threads/${id}`, { method: 'DELETE' });
    setThreads(prev => prev.filter(t => t.id !== id));
    if (currentThreadId === id) createNewChat();
  };

  const speakNova = async (text: string) => {
    if (!isSpeechEnabled) return;
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) return;
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
    } catch {}
  };

  const startListening = () => {
    const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
    const Recognition = SpeechRecognition || webkitSpeechRecognition;
    if (!Recognition) return alert("Nincs hangfelismerés támogatás.");
    const recognition = new Recognition();
    recognition.lang = "hu-HU";
    recognition.onresult = (e) => {
      setInput(e.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    setIsListening(true);
    recognition.start();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/ingest', { method: 'POST', body: formData });
      if (res.ok) {
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `📁 Szia! Feldolgoztam a **${file.name}** fájlt. Már tudok válaszolni a tartalmával kapcsolatos kérdésekre!`,
          time: now()
        }]);
      }
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    const newMessages: Message[] = [
      ...messages,
      { id: crypto.randomUUID(), role: "user", content: userMessage, time: now() }
    ];
    setMessages(newMessages);
    setIsLoading(true);

    const aiMessageId = crypto.randomUUID();
    let aiMessageAdded = false;
    let fullReply = '';

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) }),
      });

      if (!res.ok || !res.body) throw new Error();
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      setIsLoading(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullReply += chunk;

        if (!aiMessageAdded) {
          aiMessageAdded = true;
          setMessages(prev => [...prev, { id: aiMessageId, role: "assistant", content: fullReply, time: now() }]);
        } else {
          setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, content: fullReply } : m));
        }
      }

      // Mentés a History-ba
      const title = messages.length <= 1 ? userMessage.slice(0, 30) + "..." : undefined;
      await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentThreadId,
          title: title || threads.find(t => t.id === currentThreadId)?.title || "Beszélgetés",
          messages: [...newMessages, { id: aiMessageId, role: "assistant", content: fullReply, time: now() }]
        })
      });
      
      // Frissítjük a listát a sidebar-ban
      const threadRes = await fetch('/api/threads');
      const threadData = await threadRes.json();
      setThreads(threadData.threads);

      void speakNova(fullReply);

    } catch {
      setIsLoading(false);
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "assistant", content: "Hiba történt a válaszadás során.", time: now() }]);
    }
  };

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden relative">
      
      {/* SIDEBAR */}
      <div className={`
        ${isSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full w-0'} 
        transition-all duration-300 ease-in-out bg-slate-900 flex flex-col shrink-0 z-40 absolute md:relative h-full
      `}>
        <div className="p-4 flex flex-col h-full">
          <button 
            onClick={createNewChat}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 mb-6"
          >
            <span>+</span> Új beszélgetés
          </button>
          
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            <p className="text-xs font-semibold text-slate-500 px-2 mb-2 uppercase tracking-wider">Korábbiak</p>
            {threads.map(t => (
              <div 
                key={t.id}
                onClick={() => loadThread(t.id)}
                className={`
                  group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all
                  ${currentThreadId === t.id ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}
                `}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate pr-2 font-medium">{t.title}</p>
                  <p className="text-[10px] opacity-50">{new Date(t.created_at).toLocaleDateString('hu-HU')}</p>
                </div>
                <button 
                  onClick={(e) => deleteThread(e, t.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-4 border-t border-slate-800">
            <button 
              onClick={() => setIsKnowledgeOpen(true)}
              className="w-full p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all flex items-center gap-3 text-sm"
            >
              <span>📚</span> Tudásbázis kezelő
            </button>
          </div>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 h-full relative">
        
        {/* Header */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
            >
              {isSidebarOpen ? '⟪' : '⟫'}
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                {profile.name}
              </h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-tighter font-semibold">Sólyom Daru Asszisztens</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
              className={`p-2 rounded-lg transition-colors ${isSpeechEnabled ? 'bg-blue-50 text-blue-600' : 'text-slate-400'}`}
              title="Hangszóró"
            >
              {isSpeechEnabled ? "🔊" : "🔇"}
            </button>
            <label className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer relative" title="Fájl feltöltés">
              <span>📎</span>
              <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.txt,.md" />
              {uploading && <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>}
            </label>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`
                  flex gap-3 max-w-[85%] md:max-w-[75%]
                  ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}
                `}>
                  <div className={`
                    w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white
                    ${msg.role === "user" ? "bg-slate-400" : "bg-blue-600"}
                  `}>
                    {msg.role === "user" ? "Én" : "N"}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className={`
                      p-4 rounded-2xl shadow-sm text-sm leading-relaxed
                      ${msg.role === "user" 
                        ? "bg-blue-600 text-white rounded-tr-none" 
                        : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"}
                    `}>
                      {msg.role === "assistant" ? (
                        <div className="prose prose-slate max-w-none text-inherit">
                          <ReactMarkdown>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <span className="whitespace-pre-wrap">{msg.content}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 px-1">{msg.time}</span>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">N</div>
                <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-8 bg-transparent shrink-0">
          <div className="max-w-3xl mx-auto relative bg-white rounded-3xl shadow-xl border border-slate-200">
            <div className="flex items-end p-2 gap-2">
              <button 
                onClick={startListening}
                className={`p-3 rounded-2xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
              >
                🎤
              </button>
              <textarea 
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSubmit())}
                placeholder="Írj üzenetet vagy adj feladatot..."
                rows={1}
                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 py-3 px-2 text-sm resize-none custom-scrollbar min-h-[44px]"
              />
              <button 
                onClick={() => handleSubmit()}
                disabled={!input.trim() || isLoading}
                className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white rounded-2xl transition-all shadow-lg shadow-blue-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
              </button>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-3">Nova Pro v3.0 · Sólyom Daru Kft. · AI Asszisztens</p>
        </div>

      </div>

      {isKnowledgeOpen && <KnowledgeModal onClose={() => setIsKnowledgeOpen(false)} />}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}
