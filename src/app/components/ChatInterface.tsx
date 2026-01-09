"use client";

import { useChat } from "ai/react";
import { useState, useEffect, useRef } from "react";

// Web Speech API típusdefiníciók (TypeScripthez)
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

export default function ChatInterface() {
  // Vercel AI SDK useChat hook - ez kezeli a streamelést, state-et automatikusan
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } = useChat({
    api: "/api/copilotkit", // A javított route.ts végpontunk
    initialMessages: [
      {
        id: "intro",
        role: "assistant",
        content: "Szia Gábor! Atlas vagyok. Mielőtt belevágnánk, hadd mondjam el, hogy átnéztem a Sólyom Daru profilját – lenyűgöző a flotta! Hogy indult a ma reggel, nagy a hajtás Gödöllőn?"
      }
    ],
    onFinish: (message) => {
      // Ha vége a válasznak, opcionálisan felolvashatjuk (ha a hang be van kapcsolva)
      if (isSpeechEnabled) {
        speak(message.content);
      }
    }
  });

  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Automatikus görgetés az aljára
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Szövegfelolvasás (Text-to-Speech)
  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    // Megállítjuk az előző beszédet
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hu-HU"; // Magyar nyelv kényszerítése
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    // Hang keresése (opcionális, de szebb ha van magyar hang)
    const voices = window.speechSynthesis.getVoices();
    const hungarianVoice = voices.find(v => v.lang.includes("hu"));
    if (hungarianVoice) utterance.voice = hungarianVoice;

    window.speechSynthesis.speak(utterance);
  };

  // Beszédfelismerés (Speech-to-Text)
  const startListening = () => {
    const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
    const Recognition = SpeechRecognition || webkitSpeechRecognition;

    if (!Recognition) {
      alert("A böngésződ nem támogatja a hangfelismerést (használj Chrome-ot).");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "hu-HU";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      // Szimulálunk egy input change eseményt a useChat hook számára
      const e = {
        target: { value: transcript }
      } as React.ChangeEvent<HTMLInputElement>;
      handleInputChange(e);
      
      // Opcionálisan azonnal el is küldhetjük, vagy hagyjuk a felhasználót szerkeszteni
      // Most csak beírjuk a mezőbe.
    };

    recognition.start();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Üzenetek listája */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${
                m.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-white text-slate-800 border border-slate-100 rounded-bl-none"
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
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

      {/* Input sáv */}
      <div className="bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          
          <div className="flex gap-2">
            {/* Hang gombok */}
            <button
              type="button"
              onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
              className={`p-3 rounded-full transition-colors ${
                isSpeechEnabled ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
              title="Felolvasás be/ki"
            >
              {isSpeechEnabled ? "🔊" : "🔇"}
            </button>

            <input
              className="flex-1 border border-slate-300 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder:text-slate-400"
              value={input}
              placeholder="Írj üzenetet vagy használd a mikrofont..."
              onChange={handleInputChange}
            />

            <button
              type="button"
              onClick={startListening}
              className={`p-3 rounded-full transition-colors ${
                isListening ? "bg-red-500 text-white animate-pulse" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              title="Beszéd indítása"
            >
              🎤
            </button>

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95"
            >
              Küldés
            </button>
          </div>
          
          {/* Mobil helper text */}
          <div className="text-xs text-center text-slate-400">
            Atlasz AI Asszisztens • Sólyom Daru Projekt
          </div>
        </form>
      </div>
    </div>
  );
}