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
      content: "Szia Gábor! Atlas vagyok. Mielőtt belevágnánk, hadd mondjam el, hogy átnéztem a Sólyom Daru profilját – lenyűgöző a flotta! Hogy indult a ma reggel, nagy a hajtás Gödöllőn?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hungarianVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        const hungarianVoice = voices.find(v => v.lang.includes("hu"));
        if (hungarianVoice) {
          hungarianVoiceRef.current = hungarianVoice;
        }
      };

      updateVoices();
      window.speechSynthesis.addEventListener("voiceschanged", updateVoices);
      return () => {
        window.speechSynthesis.removeEventListener("voiceschanged", updateVoices);
      };
    }
  }, []);

  const speak = (text: string) => {
    if (!isSpeechEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hu-HU";

    // Use cached voice if available, otherwise fallback to getVoices()
    if (hungarianVoiceRef.current) {
      utterance.voice = hungarianVoiceRef.current;
    } else {
      const voices = window.speechSynthesis.getVoices();
      const hungarianVoice = voices.find(v => v.lang.includes("hu"));
      if (hungarianVoice) {
        utterance.voice = hungarianVoice;
        hungarianVoiceRef.current = hungarianVoice;
      }
    }

    window.speechSynthesis.speak(utterance);
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
    };
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/copilotkit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "Hálózati hiba");
      }

      if (data.content) {
        setMessages(prev => [...prev, { role: "assistant", content: data.content }]);
        speak(data.content);
      } else {
        throw new Error("Üres választ kaptunk a szervertől.");
      }

    } catch (error: any) {
      console.error("Hiba:", error);
      setMessages(prev => [
        ...prev, 
        { role: "assistant", content: `⚠️ Hiba történt: ${error.message}` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${
              m.role === "user" ? "bg-blue-600 text-white rounded-br-none" : "bg-white text-slate-800 border border-slate-100 rounded-bl-none"
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed">
                {m.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 rounded-2xl px-5 py-3 rounded-bl-none">
              <span className="animate-pulse text-slate-400">Atlasz gondolkodik...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <form onSubmit={sendMessage} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <button type="button" onClick={() => setIsSpeechEnabled(!isSpeechEnabled)} className={`p-3 rounded-full transition-colors ${isSpeechEnabled ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
              {isSpeechEnabled ? "🔊" : "🔇"}
            </button>
            <input
              className="flex-1 border border-slate-300 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Írj üzenetet..."
            />
            <button type="button" onClick={startListening} className={`p-3 rounded-full transition-colors ${isListening ? "bg-red-500 text-white animate-pulse" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              🎤
            </button>
            <button type="submit" disabled={isLoading || !input.trim()} className="px-6 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 disabled:opacity-50">
              Küldés
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}