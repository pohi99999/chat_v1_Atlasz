import ChatInterface from "./components/ChatInterface";

export default function Home() {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-100 overflow-hidden">
      
      {/* Bal oldali információs sáv - Asztalon látható, mobilon rejtett */}
      <div className="hidden md:flex md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 flex-col p-8 justify-between shadow-xl z-10">
        <div>
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl font-bold text-white mb-6 shadow-lg">
            A
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Atlasz</h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Professzionális, tanulni képes AI asszisztens. Lokális tudásbázis, hangalapú interakció és dinamikus emlékezet.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                🧠
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Dinamikus Emlékezet</h3>
                <p className="text-sm text-gray-500">Megjegyzi a beszélgetések fontos tényeit, hogy később is tudjon rájuk hivatkozni.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                📚
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Élő Tudásbázis (RAG)</h3>
                <p className="text-sm text-gray-500">Tölts fel PDF, TXT vagy Markdown fájlokat a chat fejlécében lévő 📎 ikonnal, és azonnal kérdezhetsz belőlük.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                🗣️
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Hang Interakció</h3>
                <p className="text-sm text-gray-500">Diktálj a mikrofon (🎤) ikonnal, és hallgasd a választ Nova hangján (🔊).</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-400">
          <p>Powered by Next.js & OpenAI</p>
          <p>Atlasz v2.0</p>
        </div>
      </div>

      {/* Jobb oldali fő chat ablak - Teljes szélesség mobilon */}
      <div className="flex-1 p-4 md:p-8 h-full bg-slate-50">
        <ChatInterface />
      </div>

    </div>
  );
}
