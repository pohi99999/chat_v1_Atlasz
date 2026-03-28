# Memory Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Memóriák megtekintése és egyenkénti törlése egy modal panelből, a chat fejlécébe integrált 🧠 gombbal.

**Architecture:** Három lépés: (1) GET /api/memories visszaadja az `id`-t is; (2) új DELETE /api/memories/[id] endpoint törli az adott memóriát; (3) ChatInterface.tsx kap egy MemoryModal komponenst és 🧠 gombot mindkét fejlécben. Optimistic UI: törléskor azonnal eltűnik a sorból, háttérben fut a DELETE hívás.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS v4, meglévő `LocalVectorDB` singleton (`src/lib/db.ts`)

---

### Task 1: GET /api/memories – id mező hozzáadása

**Files:**
- Modify: `src/app/api/memories/route.ts`

- [ ] **Step 1: Módosítsd a route.ts fájlt**

A teljes `src/app/api/memories/route.ts` tartalma legyen:

```ts
import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export interface MemorySummary {
  id: string;
  text: string;
  source: string;
  createdAt: string;
}

export async function GET() {
  try {
    await db.init();

    const memories: MemorySummary[] = db.memories.map((m) => ({
      id: m.id,
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

- [ ] **Step 2: TypeScript ellenőrzés**

```bash
cd "G:/Brunella/.000_PROJEKTEK/005_Chat_Agent_Nova (cég botja)/Nova_assisst" && npx tsc --noEmit
```

Elvárt: hibamentes.

- [ ] **Step 3: Manuális teszt**

```bash
cd "G:/Brunella/.000_PROJEKTEK/005_Chat_Agent_Nova (cég botja)/Nova_assisst" && npx tsx src/__tests__/db.test.ts
```

Elvárt: PASS (meglévő teszt nem törhet el).

- [ ] **Step 4: Commit**

```bash
cd "G:/Brunella/.000_PROJEKTEK/005_Chat_Agent_Nova (cég botja)/Nova_assisst" && git add src/app/api/memories/route.ts && git commit -m "feat: include id field in GET /api/memories response

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 2: DELETE /api/memories/[id] – új endpoint

**Files:**
- Create: `src/app/api/memories/[id]/route.ts`

- [ ] **Step 1: Hozd létre a könyvtárat és a fájlt**

Hozd létre a `src/app/api/memories/[id]/route.ts` fájlt az alábbi tartalommal:

```ts
import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await db.init();
    const { id } = await params;

    const index = db.memories.findIndex((m) => m.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Nem található' }, { status: 404 });
    }

    db.memories.splice(index, 1);
    await db.saveMemories();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Szerver hiba';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

**Fontos:** Next.js 15-ben a route params `Promise`-ként érkeznek, ezért `await params` szükséges.

- [ ] **Step 2: TypeScript ellenőrzés**

```bash
cd "G:/Brunella/.000_PROJEKTEK/005_Chat_Agent_Nova (cég botja)/Nova_assisst" && npx tsc --noEmit
```

Elvárt: hibamentes.

- [ ] **Step 3: Commit**

```bash
cd "G:/Brunella/.000_PROJEKTEK/005_Chat_Agent_Nova (cég botja)/Nova_assisst" && git add src/app/api/memories/[id]/route.ts && git commit -m "feat: add DELETE /api/memories/[id] endpoint

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 3: MemoryModal komponens + 🧠 gomb a ChatInterface-ben

**Files:**
- Modify: `src/app/components/ChatInterface.tsx`

Ez a task a `ChatInterface.tsx` fájlt módosítja. A meglévő logika (chat, TTS, STT, file upload) **érintetlen marad** – csak új state, egy új komponens és a fejlécek bővülnek.

- [ ] **Step 1: MemoryItem interfész és MemoryModal komponens hozzáadása**

A `FileUploadButton` függvény UTÁN (de még az `export default function ChatInterface()` ELŐTT) add hozzá ezt a kódblokkot:

```tsx
interface MemoryItem {
  id: string;
  text: string;
  source: string;
  createdAt: string;
}

interface MemoryModalProps {
  onClose: () => void;
}

function MemoryModal({ onClose }: MemoryModalProps) {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/memories');
        if (!res.ok) return;
        const data = await res.json() as { memories: MemoryItem[] };
        setMemories(data.memories);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const handleDelete = async (id: string) => {
    // Optimistic: azonnal eltávolítjuk
    setMemories(prev => prev.filter(m => m.id !== id));
    await fetch(`/api/memories/${id}`, { method: 'DELETE' });
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">Megjegyzett tények</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
            aria-label="Bezárás"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {loading && (
          <p className="text-sm text-slate-400 text-center py-4">Betöltés...</p>
        )}

        {!loading && memories.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-4">Még nincs megjegyzett tény.</p>
        )}

        {!loading && memories.length > 0 && (
          <ul className="space-y-2 max-h-80 overflow-y-auto">
            {memories.map((m) => (
              <li key={m.id} className="flex items-start gap-2 p-2 rounded-xl hover:bg-slate-50 group">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800 leading-snug">{m.text}</p>
                  <span
                    className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                      m.source === 'user-extraction'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-purple-50 text-purple-600'
                    }`}
                  >
                    {m.source === 'user-extraction' ? 'Te mondtad' : 'AI kinyerte'}
                  </span>
                </div>
                <button
                  onClick={() => void handleDelete(m.id)}
                  className="shrink-0 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1 rounded"
                  aria-label="Tény törlése"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
```

**Fontos:** A `MemoryModal` belsejében `useState` és `useEffect` van – ez csak azért működik mert a `MemoryModal` önálló, nevesített komponens (nem inline). A `useState` import már megvan a `ChatInterface.tsx` tetején.

- [ ] **Step 2: `isMemoryOpen` state hozzáadása a ChatInterface-hez**

A `ChatInterface` belső state-jei közé (a többi `useState` sor mellé) add hozzá:

```tsx
const [isMemoryOpen, setIsMemoryOpen] = useState(false);
```

- [ ] **Step 3: 🧠 gomb hozzáadása a mobil fejlécbe**

Keresd meg a mobil fejléc gomb-csoportját (a `<div className="flex gap-1 items-center">` sort a mobil headerben, kb. 255. sor körül). A `<FileUploadButton mobile={true} .../>` sor ELÉ add be:

```tsx
<button
  onClick={() => setIsMemoryOpen(true)}
  className="p-2 rounded-full hover:bg-white/20 transition-colors text-white/80"
  title="Megjegyzett tények"
  aria-label="Megjegyzett tények megnyitása"
>
  🧠
</button>
```

- [ ] **Step 4: 🧠 gomb hozzáadása a desktop fejlécbe**

Keresd meg a desktop fejléc gomb-csoportját (a `<div className="flex gap-1 items-center">` sort a desktop headerben, kb. 285. sor körül). A `<FileUploadButton mobile={false} .../>` sor ELÉ add be:

```tsx
<button
  onClick={() => setIsMemoryOpen(true)}
  className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500"
  title="Megjegyzett tények"
  aria-label="Megjegyzett tények megnyitása"
>
  🧠
</button>
```

- [ ] **Step 5: MemoryModal renderelése a JSX végén**

A `return (...)` blokk záró `</div>` tagje ELÉ add be:

```tsx
{isMemoryOpen && (
  <MemoryModal onClose={() => setIsMemoryOpen(false)} />
)}
```

- [ ] **Step 6: TypeScript ellenőrzés**

```bash
cd "G:/Brunella/.000_PROJEKTEK/005_Chat_Agent_Nova (cég botja)/Nova_assisst" && npx tsc --noEmit
```

Elvárt: hibamentes.

- [ ] **Step 7: Dev szerver indítása és manuális tesztelés**

```bash
npm run dev
```

Ellenőrizendő:
- [ ] 🧠 gomb megjelenik desktop fejlécben (📎 és 🔊 mellett)
- [ ] 🧠 gomb megjelenik mobil fejlécben is (DevTools, < 768px)
- [ ] Gombra kattintva modal nyílik
- [ ] Modal háttérre kattintva bezárul
- [ ] X gombra kattintva bezárul
- [ ] Ha van memória: lista látszik forrás chipekkel
- [ ] Ha nincs memória: "Még nincs megjegyzett tény." üzenet
- [ ] Sor fölé húzva megjelenik az X törlés gomb
- [ ] Törlés: sor azonnal eltűnik

- [ ] **Step 8: Commit**

```bash
cd "G:/Brunella/.000_PROJEKTEK/005_Chat_Agent_Nova (cég botja)/Nova_assisst" && git add src/app/components/ChatInterface.tsx && git commit -m "feat: add memory management modal with delete support

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```
