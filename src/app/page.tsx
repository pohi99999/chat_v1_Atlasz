"use client";
import { useState } from "react";
import ChatInterface from "./components/ChatInterface";

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold text-lg">A</div>
          <h1 className="text-xl font-semibold">Igényfelmérő Ügynök - Atlas</h1>
        </div>
        <div className="text-sm text-slate-400">Solyom Daru Kft. Projekt</div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Info Panel */}
        <div className="w-1/2 p-8 overflow-y-auto">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-blue-600 mb-4">Üdvözöllek, Gábor!</h2>
            <p className="text-lg mb-6">
              Én vagyok <strong>Atlasz</strong>, az AI stratégiai tanácsadó.
            </p>
            <p className="mb-6">
              Azért vagyok itt, hogy a következő napokban segítsek felmérni a vállalkozásod folyamatait, és
              megtaláljuk azokat a pontokat, ahol az automatizáció a legtöbbet segíthet.
            </p>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-4">Miről fogunk beszélgetni?</h3>
              <ul className="space-y-3">
                <li>
                  <strong>1. Nap:</strong> Áttekintjük a cég működését és a kulcsembereket.
                </li>
                <li>
                  <strong>2. Nap:</strong> Megkeressük a "fájdalompontokat" és a fávagó munkákat.
                </li>
                <li>
                  <strong>3. Nap:</strong> Megtervezzük a jövőt és a digitális fejlesztéseket.
                </li>
              </ul>
            </div>

            <p className="mt-6 text-sm text-slate-600">
              Kezdjük el a beszélgetést a jobb oldali sávban! 👉
            </p>
          </div>
        </div>

        {/* Chat Panel */}
        <div className="w-1/2 border-l border-slate-200">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}
