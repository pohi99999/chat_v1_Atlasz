"use client";

import { useState, useEffect, useRef } from "react";

interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: "assistant",
      content: "Szia! Én vagyok a személyes AI asszisztensed. Képes vagyok tanulni a dokumentumaidból és a beszélgetéseinkből is. Miben segíthetek ma?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const speakNova = async (text: string) => {
    if (!isSpeechEnabled) return;
    
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) throw new Error('Audio generation failed');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
    } catch (err) {
      console.error('Nova TTS Error:', err);
    }
  };

  const startListening = () => {
    const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
    const Recognition = SpeechRecognition || webkitSpeechRecognition;
    if (!Recognition) {
      alert("A böngésződ nem támogatja a hangfelismerést.");
      return;
    }
    const recognition = new Recognition();
    recognition.lang = "hu-HU";
    recognition.continuous = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
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
      const res = await fetch('/api/ingest', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, { role: "assistant", content: `📁 Fájl feldolgozva: ${file.name}. Már tudok válaszolni a benne lévő adatokra!` }]);
      } else {
        alert('Hiba a fájl feltöltésekor: ' + data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      // Reset input
      if (e.target) e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) throw new Error("API hiba");
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      
      // Nova hang lejátszása, ha a hangszóró be van kapcsolva
      speakNova(data.reply);
      
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sajnálom, hiba történt a válaszadás közben." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-lg shadow-xl overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-blue-600 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-blue-600 shadow-md">
            A
          </div>
          <div>
            <h2 className="text-xl font-bold">Atlasz AI</h2>
            <p className="text-xs text-blue-100 opacity-90">Élő Tudásbázis & Asszisztens</p>
          </div>
        </div>
        <div className="flex gap-2">
          {/* File Upload Button */}
          <label className="cursor-pointer p-2 rounded-full hover:bg-white/20 transition-colors relative" title="Tudásbázis bővítése (PDF/TXT)">
            <span className="text-xl">📎</span>
            <input 
              type="file" 
              className="hidden" 
              accept=".txt,.pdf,.md,.csv" 
              onChange={handleFileUpload}
              disabled={uploading}
            />
            {uploading && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>}
          </label>
          {/* Voice Output Toggle */}
          <button 
            onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
            className={`p-2 rounded-full hover:bg-white/20 transition-colors ${isSpeechEnabled ? 'text-green-300' : 'opacity-70'}`}
            title="Nova hang be/ki"
          >
            {isSpeechEnabled ? "🔊" : "🔇"}
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${msg.role === "user" ? "bg-blue-600 text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none border border-gray-100"}`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-gray-100 flex gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={startListening}
            className={`p-3 rounded-full text-white transition-all shadow-md ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-500 hover:bg-gray-600'}`}
            disabled={isLoading}
            title="Diktálás (Böngésző STT)"
          >
            🎤
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Kérdezz vagy küldj feladatot..."
            className="flex-1 rounded-full border border-gray-300 px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 shadow-inner"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 text-white rounded-full px-6 py-3 font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            Küldés
          </button>
        </div>
      </form>
    </div>
  );
}
