"use client";
import ChatInterface from "./components/ChatInterface";

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header - Kompakt mobilon */}
      <header className="bg-slate-900 text-white p-3 md:p-4 shadow-md flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-lg md:text-xl shadow-lg border-2 border-slate-800">A</div>
          <div>
            <h1 className="text-lg md:text-xl font-semibold leading-tight">Atlasz</h1>
            <p className="text-xs text-blue-200 hidden md:block">AI Stratégiai Tanácsadó</p>
          </div>
        </div>
        <div className="text-xs md:text-sm text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
          Sólyom Daru Kft.
        </div>
      </header>

      {/* Main Content - Reszponzív Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Info Panel - Mobilon rejtve, csak Desktopon látszik */}
        <div className="hidden md:block w-full md:w-5/12 lg:w-1/3 p-6 lg:p-8 overflow-y-auto bg-white border-r border-slate-200">
          <div className="max-w-xl mx-auto space-y-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-blue-900 mb-3">Üdvözöllek, Gábor!</h2>
              <p className="text-slate-600 leading-relaxed">
                Én vagyok <strong>Atlasz</strong>, a digitális asszisztens, aki segít felmérni a vállalkozásod rejtett tartalékait.
              </p>
            </div>

            <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                📅 A 3 Napos Menetrend
              </h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <div>
                    <strong className="block text-slate-900">A Térkép (Ma)</strong>
                    <span className="text-sm text-slate-600">Áttekintjük a cég működését és a kulcsembereket.</span>
                  </div>
                </li>
                <li className="flex gap-3 opacity-60">
                  <span className="flex-shrink-0 w-6 h-6 bg-slate-300 text-slate-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <div>
                    <strong className="block text-slate-900">A Fájdalompontok</strong>
                    <span className="text-sm text-slate-600">Megkeressük, hol folyik el az idő és a pénz.</span>
                  </div>
                </li>
                <li className="flex gap-3 opacity-60">
                  <span className="flex-shrink-0 w-6 h-6 bg-slate-300 text-slate-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <div>
                    <strong className="block text-slate-900">A Jövőkép</strong>
                    <span className="text-sm text-slate-600">Konkrét megoldási javaslatok és dashboard terv.</span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="text-sm text-slate-500 border-t border-slate-100 pt-4">
              <p>💡 <strong>Tipp:</strong> Használd a mikrofon ikont a beszélgetéshez, ha úton vagy!</p>
            </div>
          </div>
        </div>

        {/* Chat Panel - Mobilon teljes képernyő, Desktopon a maradék hely */}
        <div className="flex-1 w-full bg-slate-50 relative">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}