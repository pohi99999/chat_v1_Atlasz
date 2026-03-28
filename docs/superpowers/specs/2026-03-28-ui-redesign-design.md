# UI Redesign – Atlasz Chat v2.1

**Dátum:** 2026-03-28
**Projekt:** Nova_assisst (Atlasz AI Chat)
**Típus:** Teljes UI újraírás (ChatInterface.tsx + page.tsx)

---

## Célkitűzés

A meglévő v2.0 UI funkcionalitása marad, csak a vizuális réteg és UX cserélődik. Cél: modern, minimál, profi megjelenés – céges AI asszisztenshez illő stílus.

---

## Megközelítés

Teljes JSX + Tailwind újraírás `ChatInterface.tsx`-ben és `page.tsx`-ben. Az összes üzleti logika (`handleSubmit`, `speakNova`, `startListening`, `handleFileUpload`, memory betöltés) érintetlen marad.

---

## 1. Layout és színrendszer

- **Oldal háttér:** `bg-slate-100`
- **Akcentszín:** `profile.accentColor` (`#2563eb`) – CSS változóként (`--accent`) átadva inline style-lal a gyökér elemen, majd `var(--accent)` hivatkozás a Tailwind arbitrary value helyeken
- **Bal oldalsáv (md+ desktop):** fehér, `border-r border-slate-200`, árnyék nélkül
  - Avatar: kerek (`rounded-full`), `bg-[--accent]`, a név első betűje fehéren
  - Funkció ikonok: emoji helyett `div` körök (`bg-blue-50`, `bg-purple-50`, `bg-green-50`) + szín
  - Alul: `text-slate-400 text-xs` – verzió + "Powered by"
- **Mobil fejléc (md alatt):** kompakt sáv a chat tetején
  - Tartalom: `[avatar] [Atlasz · Sólyom Daru Kft.] [● Online chip] [📎] [🔊/🔇]`
  - Asztali nézetben rejtett: `flex md:hidden` (mobilon látható, desktopon az oldalsáv veszi át)

---

## 2. Chat buborékok és üzenetterület

**User buborék:**
- `bg-[--accent] text-white`
- `rounded-2xl rounded-tr-sm` (jobb felső sarok éles)
- Timestamp: `text-xs text-white/60` jobbra lent (HH:MM)

**AI buborék:**
- `bg-white border border-slate-100 shadow-sm text-slate-800`
- `rounded-2xl rounded-tl-sm` (bal felső sarok éles)
- `react-markdown` renderelés: félkövér, listák, inline kód (`bg-slate-100 rounded px-1`)
- Timestamp: `text-xs text-slate-400` balra lent

**Loading indicator:**
- 3 bouncing pont, `bg-[--accent]/40` szín

**Üzenetterület:**
- `space-y-4` (v2.0: `space-y-6`)
- Új üzenet animáció: `animate-fadeInUp` – `opacity: 0 → 1`, `translateY: 8px → 0`, `duration: 200ms`
- A `fadeInUp` keyframe a `globals.css`-be kerül

---

## 3. Input terület

**Textarea:**
- `rows={1}`, `resize-none`, JS auto-grow (max 4 sor)
- `rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[--accent]/50`
- Placeholder: `"Kérdezz vagy küldj feladatot..."`

**Gombok:**
- 🎤 bal oldal: `bg-slate-100 hover:bg-slate-200 rounded-full p-3`
  - Hallgatás közben: `bg-red-500 text-white animate-pulse`
- Küldés jobb oldal: `bg-[--accent] text-white rounded-full p-3` – ➤ nyíl SVG ikon (nem szöveges)
- Disabled: `opacity-40 cursor-not-allowed`

**Billentyűzet:**
- `Enter` = küldés (`!shiftKey` feltétellel)
- `Shift+Enter` = új sor

---

## 4. Új függőség

```bash
npm install react-markdown
```

`react-markdown` csak az AI buborékon belül használatos. Nincs plugin (rehype-raw stb.) – alap markdown elég.

---

## Érintett fájlok

| Fájl | Változás |
|------|---------|
| `src/app/page.tsx` | Teljes JSX újraírás |
| `src/app/components/ChatInterface.tsx` | Teljes JSX újraírás, logika érintetlen |
| `src/app/globals.css` | `fadeInUp` keyframe hozzáadása |
| `package.json` | `react-markdown` dependency |

---

## Nem változik

- `src/lib/` összes modul
- `src/app/api/` összes route
- `src/config/profile.json` és `system-prompt.md`
- Chat logika (fetch, TTS, STT, file upload, memory)
