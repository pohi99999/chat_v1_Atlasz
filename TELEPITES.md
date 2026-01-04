# Atlas AI Asszisztens - Telepítési Útmutató

## Előfeltételek

- Node.js 18+ vagy 20+
- Python 3.11+ (opcionális, ha az agent-et használni szeretnéd)
- OpenAI API kulcs

## Telepítési Lépések

### 1. Függőségek telepítése

```bash
npm install
```

### 2. Környezeti változók beállítása

Hozz létre egy `.env.local` fájlt a projekt gyökerében:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4o
NEXT_PUBLIC_COPILOTKIT_DEV_CONSOLE=false
```

### 3. Alkalmazás indítása

#### Csak a Next.js frontend:

```bash
npm run dev
```

Az alkalmazás elérhető lesz: `http://localhost:3000`

#### Frontend + Python Agent (opcionális):

Először telepítsd a Python agent függőségeit:

```bash
cd agent
python -m venv .venv
.venv\Scripts\activate  # Windows
# vagy
source .venv/bin/activate  # Linux/Mac

pip install -e .
cd ..
```

Majd indítsd mindkettőt:

```bash
npm run dev:ui  # Frontend
npm run dev:agent  # Agent (másik terminálban)
```

## Hibakeresés

### "OPENAI_API_KEY is not set" hiba

- Ellenőrizd, hogy létrehoztad-e a `.env.local` fájlt
- Győződj meg róla, hogy az API kulcs érvényes
- Vercel-en: Project Settings → Environment Variables

### React 19 kompatibilitási problémák

Az alkalmazás React 19-et használ. Ha problémákat tapasztalsz:

```bash
rm -rf node_modules package-lock.json
npm install
```

### CopilotKit streaming hibák

Ha a chatbot nem válaszol:
1. Ellenőrizd a böngésző konzolt
2. Nézd meg a szerver logokat
3. Győződj meg róla, hogy az OpenAI API kulcs működik

## Vercel Deployment

1. Push-old a kódot GitHub-ra
2. Importáld a projektet Vercel-be
3. Állítsd be a környezeti változókat:
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` (opcionális)
4. Deploy!

**Fontos:** A Python agent NEM fog működni Vercel serverless környezetben. Csak a Next.js chatbot fog működni.

## Funkciók

- ✅ AI chatbot magyar nyelven (Atlas)
- ✅ Igényfelmérő beszélgetés 3 fázisban
- ✅ Vercel-kompatibilis deployment
- ✅ React 19 támogatás
- ✅ Típusbiztos TypeScript
- ⚠️ Python agent (csak lokális fejlesztéshez)

## Támogatás

Ha problémád van, ellenőrizd:
1. Node.js verzió (18+)
2. OpenAI API kulcs érvényessége
3. `.env.local` fájl létezése
4. Konzol hibák a böngészőben és szerverben

