# Jules Agent - Fejlesztési és Tesztelési Irányelvek

Ez a dokumentum utasításokat tartalmaz **Jules** (és más fejlesztő ügynökök) számára az **Atlasz (Sólyom Daru Chatbot)** projekt karbantartásához, teszteléséhez és továbbfejlesztéséhez.

## 1. Környezet és Stack

Mielőtt bármilyen kódot írsz, értsd meg a környezetet:
- **Framework:** Next.js 15 (App Router)
- **Nyelv:** TypeScript
- **Stílus:** Tailwind CSS v4
- **AI Integráció:** Vercel AI SDK (`ai` csomag) + OpenAI (`openai` csomag)
- **Deployment:** Vercel (Serverless Functions)

**FONTOS:** A projekt gyökerében lévő `agent/` mappa (Python) jelenleg **DEPRECATED / HASZNÁLATON KÍVÜL** van. Ne módosítsd, és ne próbáld integrálni, kivéve ha kifejezett utasítást kapsz rá. A fókusz a `src/app` mappán van.

## 2. Tesztelési Stratégia (Jules Tasks)

Jelenleg nincsenek tesztek. A következő feladatokat kell prioritásként kezelned tesztelés terén:

### A. Unit Tesztek (Javasolt eszköz: Vitest + React Testing Library)
Hozz létre teszteket a következőkhöz:
1.  **`src/app/api/copilotkit/route.ts`:**
    -   Mockold az OpenAI választ.
    -   Teszteld, hogy a System Prompt helyesen kerül-e be a hívásba.
    -   Teszteld a hibakezelést (pl. mi történik, ha nincs API kulcs).
2.  **`src/app/components/ChatInterface.tsx`:**
    -   Teszteld a renderelést (megjelennek-e az üzenetek).
    -   Teszteld az input mező működését.
    -   Ellenőrizd, hogy a "Loading" állapot megjelenik-e.

### B. End-to-End (E2E) Tesztek (Javasolt eszköz: Playwright)
Írj E2E teszteket a felhasználói folyamatokra:
1.  **"Happy Path":**
    -   Oldal betöltése -> Üdvözlő üzenet megjelenése.
    -   Felhasználó beír valamit -> Válasz érkezik.
2.  **Mobil Nézet:**
    -   Szimulálj iPhone/Android viewportot.
    -   Ellenőrizd, hogy a Chat felület kitölti-e a képernyőt, és az Infó panel eltűnik-e.

## 3. Optimalizálási Irányelvek

### Teljesítmény (Performance)
- **React Render:** Figyelj a `ChatInterface`-ben a re-renderek számára. A `useChat` hook már optimalizált, de ha új funkciót adsz hozzá (pl. komplexebb UI elemek az üzenetekben), használj `React.memo`-t.
- **Bundle Size:** Tartsd kicsiben a klienst. Ne húzz be nagy library-ket (pl. nehéz dátumkezelők), ha nem feltétlenül szükséges.

### Hangfunkciók (Audio)
- **Latency:** A Web Speech API (`speechSynthesis`) kliens oldali, tehát gyors. Ha a jövőben szerver oldali TTS-re (pl. OpenAI Audio API) váltunk, figyelj a streamelésre (chunk transfer), hogy ne legyen nagy késleltetés a válasz és a hang között.
- **Fallback:** Mindig kezeld le, ha a böngésző nem támogatja a Speech API-t (pl. régebbi Safari).

### Biztonság (Security)
- **API Védelem:** A jelenlegi `/api/copilotkit` végpont publikus.
  - **Feladat:** Implementálj Rate Limiting-et (pl. `@vercel/kv` vagy `upstash` segítségével), hogy elkerüljük a botos támadásokat és a magas OpenAI számlát.
  - **Auth:** Ha a projekt élesebb fázisba lép, javasolj egyszerű jelszavas védelmet (NextAuth).

## 4. Fejlesztési Munkafolyamat (Workflow)

1.  **Elemzés:** Mindig olvasd el a `GEMINI.md`-t a legfrissebb állapotért.
2.  **Módosítás:**
    -   Használd a `code_analyzer` eszközt a változtatások előtt a mellékhatások felmérésére.
    -   Kódot mindig TypeScript típusossággal írj (`interface`-ek definiálása).
3.  **Ellenőrzés:**
    -   Futtasd a `npm run lint` parancsot (ha van, vagy `next lint`).
    -   Győződj meg róla, hogy a build (`npm run build`) sikeres.

## 5. Eszközök (Tools)

A munkád során ezeket az eszközöket használd:
-   **Fájlkezelés:** `read_file`, `write_file` (a kód módosításához).
-   **Kutatás:** `glob`, `search_file_content` (ha keresel valamit a kódban).
-   **Parancssor:** `run_shell_command` (tesztek futtatásához, csomagok telepítéséhez).

**Dátum:** 2026. január 9.
