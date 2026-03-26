# Atlasz AI – 4 Fejlesztés Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Négy fejlesztés az Atlasz AI-ban: TypeScript build fix, szervezeti testreszabhatóság (profile + system-prompt.md), memória perzisztencia induláskor, és AI válasz ténykinyerés.

**Architecture:** A meglévő Next.js 15 App Router struktúrát bővítjük. Új fájlok: `src/config/system-prompt.md`, `src/app/api/memories/route.ts`. A `config.ts`, `api/chat/route.ts`, `ChatInterface.tsx` módosul. A `next.config.ts`-ből töröljük az TypeScript/ESLint ignore flageket.

**Tech Stack:** Next.js 15, TypeScript 5, OpenAI SDK (`openai`), React 18 hooks, JSON file-based vector DB

---

## Fájlstruktúra – Érintett Fájlok

| Fájl | Változás |
|------|----------|
| `next.config.ts` | `ignoreBuildErrors: true` és `ignoreDuringBuilds: true` törlése |
| `src/lib/config.ts` | `AssistantProfile` bővítés, `getSystemPrompt()` async függvény hozzáadása |
| `src/config/profile.json` | `accentColor`, `greeting` mezők hozzáadása |
| `src/config/system-prompt.md` | ÚJ – statikus személyiség/stílus leírás (eddig hardcoded volt `api/chat/route.ts`-ben) |
| `src/app/api/chat/route.ts` | `getSystemPrompt()` használata, `extractAndSaveFact` source paraméterrel, párhuzamos AI ténykinyerés |
| `src/app/api/memories/route.ts` | ÚJ – GET végpont a memóriák listázásához |
| `src/app/components/ChatInterface.tsx` | Startup memória betöltés, üdvözlés a memória alapján, `IWindow` típus javítás |

---

## Task 1: TypeScript és ESLint Build Fix

**Files:**
- Modify: `next.config.ts`
- Modify: `src/app/api/chat/route.ts` (error: any → unknown)
- Modify: `src/lib/db.ts` (err: any → unknown)
- Modify: `src/app/components/ChatInterface.tsx` (IWindow any → proper types)

- [ ] **Step 1: Kapcsoljuk be a TypeScript ellenőrzést**

Csere `next.config.ts`-ben – a teljes fájl új tartalma:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@copilotkit/runtime"],
};

export default nextConfig;
```

- [ ] **Step 2: Futtasd a buildet, gyűjtsd össze a hibákat**

```bash
cd "G:/Brunella/.000_PROJEKTEK/005_Chat_Agent/chat_v1_Atlasz"
npm run build 2>&1 | head -80
```

Elvárt: TypeScript/ESLint hibák listája jelenik meg.

- [ ] **Step 3: Javítsd a `catch (error: any)` hibákat**

`src/app/api/chat/route.ts` – sor 112, csere:
```typescript
// ELŐTTE:
} catch (error: any) {
  console.error('Chat API Hiba:', error);
  return NextResponse.json({ error: error.message || 'Szerver hiba' }, { status: 500 });
}

// UTÁNA:
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Szerver hiba';
  console.error('Chat API Hiba:', error);
  return NextResponse.json({ error: message }, { status: 500 });
}
```

`src/lib/db.ts` – sor 39, csere:
```typescript
// ELŐTTE:
} catch (err: any) {
  if (err.code === 'ENOENT') {

// UTÁNA:
} catch (err: unknown) {
  if (err instanceof Error && (err as NodeJS.ErrnoException).code === 'ENOENT') {
```

- [ ] **Step 4: Javítsd az `IWindow` típust `ChatInterface.tsx`-ben**

`src/app/components/ChatInterface.tsx` – sor 5-8, csere:
```typescript
// ELŐTTE:
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

// UTÁNA:
interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

interface IWindow extends Window {
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
  SpeechRecognition?: SpeechRecognitionConstructor;
}
```

- [ ] **Step 5: Futtasd újra a buildet**

```bash
npm run build 2>&1 | tail -20
```

Elvárt: `✓ Compiled successfully` vagy csak ESLint figyelmeztetések (nem hibák). Ha új TypeScript hiba jelenik meg, javítsd a hibaüzenet alapján, majd futtasd újra.

- [ ] **Step 6: Futtasd a lintert**

```bash
npm run lint 2>&1
```

Elvárt: `✔ No ESLint warnings or errors` – ha vannak, javítsd egyenként.

- [ ] **Step 7: Commit**

```bash
git add next.config.ts src/app/api/chat/route.ts src/lib/db.ts src/app/components/ChatInterface.tsx
git commit -m "fix: enable TypeScript and ESLint checks, fix type errors"
```

---

## Task 2: Szervezeti Testreszabhatóság – Config Alap

**Files:**
- Modify: `src/config/profile.json`
- Create: `src/config/system-prompt.md`
- Modify: `src/lib/config.ts`

- [ ] **Step 1: Bővítsd a `profile.json`-t**

`src/config/profile.json` teljes új tartalma:
```json
{
  "name": "Atlasz",
  "company": "Sólyom Daru Kft.",
  "slogan": "AI Stratégiai Tanácsadó",
  "capabilities": [
    "Continuous Learning",
    "Knowledge Base",
    "Web Search"
  ],
  "voice": "nova",
  "accentColor": "#2563eb",
  "greeting": "Szia! Én vagyok a személyes AI asszisztensed. Képes vagyok tanulni a dokumentumaidból és a beszélgetéseinkből is. Miben segíthetek ma?"
}
```

- [ ] **Step 2: Hozd létre a `system-prompt.md` fájlt**

`src/config/system-prompt.md` teljes tartalma (ez a jelenlegi hardcoded stílus, kiszedve a kódból):

```markdown
### STÍLUS ÉS SZEMÉLYISÉG
- Hangnem: Professzionális, segítőkész, de lényegretörő és barátságos.
- Válaszadás: Magyar nyelven kommunikálj. A válaszaid legyenek könnyen felolvashatóak (mivel hangalapon is meg fognak szólalni). Ne használj túl sok Markdown formázást, kódot, táblázatot vagy hosszú URL-eket, ha nem feltétlenül muszáj, mert a hanggenerátor nem tudja szépen felolvasni.
- RAG (Tudásbázis) használata: Az alábbiakban megkapod a cég vagy a projekt helyi tudásbázisának legrelevánsabb részleteit és a korábbi tényeket. HA a válasz megtalálható a kontextusban, mindenképpen arra alapozd a válaszod! Ha nincs benne, hagyatkozz a saját általános tudásodra, de jelezd, ha valamiben nem vagy biztos.
```

- [ ] **Step 3: Frissítsd a `config.ts`-t**

`src/lib/config.ts` teljes új tartalma:

```typescript
import fs from 'fs/promises';
import path from 'path';
import profile from '../config/profile.json';

export interface AssistantProfile {
  name: string;
  company: string;
  slogan: string;
  capabilities: string[];
  voice: string;
  accentColor: string;
  greeting: string;
}

export const config: AssistantProfile = profile;

export async function getSystemPrompt(): Promise<string> {
  const filePath = path.join(process.cwd(), 'src', 'config', 'system-prompt.md');
  return fs.readFile(filePath, 'utf-8');
}
```

- [ ] **Step 4: Frissítsd az `/api/chat/route.ts`-t a `getSystemPrompt()` használatára**

`src/app/api/chat/route.ts` – importok kiegészítése (sor 5):
```typescript
import { config, getSystemPrompt } from '../../../lib/config.js';
```

A system prompt összeállítása (sor 82-92), csere:
```typescript
// ELŐTTE:
const SYSTEM_PROMPT = `Te vagy ${config.name}, a(z) ${config.company} dedikált asszisztense.
Szlogened: "${config.slogan}"
Fő képességeid: ${config.capabilities.join(', ')}

### STÍLUS ÉS SZEMÉLYISÉG
- Hangnem: Professzionális, segítőkész, de lényegretörő és barátságos.
- Válaszadás: Magyar nyelven kommunikálj. A válaszaid legyenek könnyen felolvashatóak (mivel hangalapon is meg fognak szólalni). Ne használj túl sok Markdown formázást, kódot, táblázatot vagy hosszú URL-eket, ha nem feltétlenül muszáj, mert a hanggenerátor nem tudja szépen felolvasni.
- RAG (Tudásbázis) használata: Az alábbiakban megkapod a cég vagy a projekt helyi tudásbázisának legrelevánsabb részleteit és a korábbi tényeket. HA a válasz megtalálható a kontextusban, mindenképpen arra alapozd a válaszod! Ha nincs benne, hagyatkozz a saját általános tudásodra, de jelezd, ha valamiben nem vagy biztos.
${contextText}
`;

// UTÁNA:
const personalityPrompt = await getSystemPrompt();
const SYSTEM_PROMPT = `Te vagy ${config.name}, a(z) ${config.company} dedikált asszisztense.
Szlogened: "${config.slogan}"
Fő képességeid: ${config.capabilities.join(', ')}

${personalityPrompt}
${contextText}
`;
```

- [ ] **Step 5: Ellenőrzés – build még mindig zöld**

```bash
npm run build 2>&1 | tail -10
```

Elvárt: sikeres build.

- [ ] **Step 6: Commit**

```bash
git add src/config/profile.json src/config/system-prompt.md src/lib/config.ts src/app/api/chat/route.ts
git commit -m "feat: extract system prompt to editable markdown, extend profile config"
```

---

## Task 3: Szervezeti Testreszabhatóság – UI Szín és Üdvözlés

**Files:**
- Modify: `src/app/components/ChatInterface.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Importáld a profilt `ChatInterface.tsx`-be és használd a `greeting`-et**

`src/app/components/ChatInterface.tsx` – sor 3 után add hozzá:
```typescript
import profile from '../../config/profile.json';
```

Sor 11-16, csere (az initial state):
```typescript
// ELŐTTE:
const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
  {
    role: "assistant",
    content: "Szia! Én vagyok a személyes AI asszisztensed. Képes vagyok tanulni a dokumentumaidból és a beszélgetéseinkből is. Miben segíthetek ma?"
  }
]);

// UTÁNA:
const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
  {
    role: "assistant",
    content: profile.greeting
  }
]);
```

- [ ] **Step 2: Importáld a profilt `page.tsx`-be és alkalmazd az `accentColor`-t**

`src/app/page.tsx` – sor 1 után add hozzá:
```typescript
import profile from "../config/profile.json";
```

A kék fejléc `div`-jén (ahol `bg-blue-600` szerepel a headerben), add hozzá az inline stílust. Keresd az `<header>` vagy a fejléc elemet, és egészítsd ki:
```typescript
// Ha van ilyen sor:
<div className="... bg-blue-600 ...">

// Változtasd erre (a className-ből NEM törlöd a bg-blue-600-t, csak hozzáadod az inline style-t fallbackként):
<div className="... bg-blue-600 ..." style={{ backgroundColor: profile.accentColor }}>
```

- [ ] **Step 3: Ellenőrzés – `npm run dev` indítás, böngészőben nézhető**

```bash
npm run dev
```

Nyisd meg: `http://localhost:3000`
Elvárt: Az üdvözlő üzenet a `profile.json` `greeting` mezőjéből jön.

- [ ] **Step 4: Commit**

```bash
git add src/app/components/ChatInterface.tsx src/app/page.tsx
git commit -m "feat: use profile greeting and accentColor in UI"
```

---

## Task 4: Konverzáció Perzisztencia – GET /api/memories + Startup Betöltés

**Files:**
- Create: `src/app/api/memories/route.ts`
- Modify: `src/app/components/ChatInterface.tsx`

- [ ] **Step 1: Hozd létre a `GET /api/memories` végpontot**

`src/app/api/memories/route.ts` teljes tartalma:

```typescript
import { NextResponse } from 'next/server';
import { db } from '../../../lib/db.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export interface MemorySummary {
  text: string;
  source: string;
  createdAt: string;
}

export async function GET() {
  try {
    await db.init();

    const memories: MemorySummary[] = db.memories.map((m) => ({
      text: m.text,
      source: (m.metadata?.['source'] as string) ?? 'unknown',
      createdAt: (m.metadata?.['createdAt'] as string) ?? '',
    }));

    return NextResponse.json({ memories });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Szerver hiba';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Teszteld a végpontot manuálisan**

```bash
# Csak akkor fut, ha npm run dev fut egy másik terminalban
curl http://localhost:3000/api/memories
```

Elvárt: `{"memories":[]}` (ha nincs még mentett tény) vagy a mentett tények listája.

- [ ] **Step 3: Add hozzá a startup logikát `ChatInterface.tsx`-hez**

`src/app/components/ChatInterface.tsx` – a meglévő `useEffect` (scroll) után add hozzá a memória betöltő `useEffect`-et:

```typescript
// Meglévő scroll useEffect után:
useEffect(() => {
  const loadMemories = async () => {
    try {
      const res = await fetch('/api/memories');
      if (!res.ok) return;
      const data = await res.json() as { memories: Array<{ text: string }> };
      if (data.memories && data.memories.length > 0) {
        const factList = data.memories
          .slice(0, 5)
          .map((m) => `– ${m.text}`)
          .join('\n');
        setMessages([{
          role: 'assistant',
          content: `Visszatértél! Ezeket tudom rólad:\n${factList}\n\nMiben segíthetek ma?`
        }]);
      }
    } catch {
      // Ha a betöltés sikertelen, az alapértelmezett üdvözlés marad
    }
  };

  loadMemories();
}, []); // Csak egyszer fut, az oldal betöltésekor
```

**Fontos:** Ez a `useEffect` a `useState` initial value-t felülírja, ha van memória. Ha nincs, a `profile.greeting` üdvözlő marad (az `useState` initial state-ből).

- [ ] **Step 4: Ellenőrzés böngészőben**

```bash
npm run dev
```

- Ha üres a `memories.json`: az eredeti `profile.greeting` jelenik meg
- Ha van tény a `memories.json`-ban: a betöltött tények listája jelenik meg

- [ ] **Step 5: Commit**

```bash
git add src/app/api/memories/route.ts src/app/components/ChatInterface.tsx
git commit -m "feat: add GET /api/memories endpoint and startup memory greeting"
```

---

## Task 5: Memória Minőség – AI Válasz Ténykinyerés

**Files:**
- Modify: `src/app/api/chat/route.ts`

- [ ] **Step 1: Bővítsd az `extractAndSaveFact` függvényt `source` paraméterrel**

`src/app/api/chat/route.ts` – sor 13, csere (a teljes függvény):

```typescript
async function extractAndSaveFact(
  message: string,
  source: 'user-extraction' | 'assistant-extraction' = 'user-extraction'
) {
  try {
    const extractionResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Te egy memóriakezelő vagy. Elemezd a következő üzenetet. Ha tartalmaz egy új, hosszú távon fontos tényt (pl. preferencia, projekt adat, cégadat, jelszó, PIN, név, stb.), amit érdemes megjegyezni, írd le azt a tényt egyetlen rövid, tényszerű, E/3 személyű mondatban. Ha NINCS benne fontos tény, vagy csak általános csevegés (pl. "Szia", "Hogy vagy?", "Köszi", "Rendben"), válaszolj pontosan a "NINCS" szóval.',
        },
        { role: 'user', content: message }
      ],
      temperature: 0.1,
    });

    const fact = extractionResponse.choices[0].message.content?.trim();

    if (fact && fact !== 'NINCS') {
      const embedding = await getEmbedding(fact);
      db.memories.push({
        id: crypto.randomUUID(),
        text: fact,
        embedding,
        metadata: {
          source,
          createdAt: new Date().toISOString()
        }
      });
      await db.saveMemories();
    }
  } catch (error: unknown) {
    console.error('Hiba a ténykinyerés során:', error);
  }
}
```

- [ ] **Step 2: Indítsd el mindkét ténykinyerést párhuzamosan**

`src/app/api/chat/route.ts` – keresd meg a sor 96-ot ahol `extractAndSaveFact(lastMessage)` szerepel. Csere:

```typescript
// ELŐTTE (sor ~96):
// 6. Aszinkron háttérfolyamat: Új tények kinyerése a memóriához
// (Nem blokkolja a válaszadást a felhasználónak)
extractAndSaveFact(lastMessage);

// 7. OpenAI Válaszgenerálás...
const response = await openai.chat.completions.create({...});
const reply = response.choices[0].message.content;
return NextResponse.json({ reply });


// UTÁNA:
// 6. OpenAI Válaszgenerálás (előbb, hogy az AI választ is feldolgozhassuk)
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages
  ],
  stream: false,
});

const reply = response.choices[0].message.content ?? '';

// 7. Párhuzamos ténykinyerés – háttérben fut, nem blokkolja a választ
Promise.all([
  extractAndSaveFact(lastMessage, 'user-extraction'),
  extractAndSaveFact(reply, 'assistant-extraction'),
]);

return NextResponse.json({ reply });
```

**Megjegyzés:** A `chat/route.ts`-ben a korábbi `openai.chat.completions.create` blokk (sor ~99-110) törlendő – ezt a teljes részt az itt látható kód VÁLTJA FEL. Az eredmény: az OpenAI hívás ELŐBB fut, majd a válasz alapján mindkét ténykinyerés elindul háttérben.

- [ ] **Step 3: Ellenőrzés – tesztelj egy konkrét üzenettel**

```bash
npm run dev
```

Küldj egy üzenetet a chatban (pl. "A cégünk 2010-ben alakult"). Ezután:

```bash
cat "G:/Brunella/.000_PROJEKTEK/005_Chat_Agent/chat_v1_Atlasz/data/memories.json"
```

Elvárt: Legalább egy bejegyzés `"source": "user-extraction"` vagy `"source": "assistant-extraction"` értékkel.

- [ ] **Step 4: Build ellenőrzés**

```bash
npm run build 2>&1 | tail -10
```

Elvárt: Sikeres build, nincs TypeScript hiba.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/chat/route.ts
git commit -m "feat: extract facts from both user and AI messages with source labeling"
```

---

## Task 6: Végső Ellenőrzés és Push

- [ ] **Step 1: Teljes build + lint**

```bash
npm run build && npm run lint
```

Elvárt: Mindkettő sikeres.

- [ ] **Step 2: Manuális end-to-end teszt**

```bash
npm run dev
```

Ellenőrizd böngészőben (`http://localhost:3000`):
1. Az üdvözlő üzenet a `profile.greeting`-ből jön
2. Küldj egy üzenetet (pl. "A cégnév Sólyom Daru Kft.")
3. Az asszisztens válaszol (Nova hang, ha be van kapcsolva)
4. Töltsd újra az oldalt → az asszisztens felsorolja amit tud
5. Töltsd fel egy PDF-et az 📎 gombbal → feldolgozza
6. Kérdezz rá a PDF tartalmára → RAG választ ad

- [ ] **Step 3: Push**

```bash
git push origin main
```

---

## Összefoglaló – Mit Változtattunk

| Fájl | Változás |
|------|----------|
| `next.config.ts` | TypeScript + ESLint ellenőrzés visszakapcsolva |
| `src/lib/db.ts` | `err: any` → `err: unknown` típusjavítás |
| `src/lib/config.ts` | `getSystemPrompt()` async függvény, `accentColor` + `greeting` az interfészben |
| `src/config/profile.json` | `accentColor`, `greeting` mezők |
| `src/config/system-prompt.md` | ÚJ – szabad szöveggel szerkeszthető személyiség |
| `src/app/api/chat/route.ts` | `getSystemPrompt()` hívás, párhuzamos ténykinyerés user+AI forrásból |
| `src/app/api/memories/route.ts` | ÚJ – GET végpont |
| `src/app/components/ChatInterface.tsx` | `IWindow` típusjavítás, `profile.greeting` használat, startup memória betöltés |
| `src/app/page.tsx` | `profile.accentColor` inline style |
