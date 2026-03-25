# Atlasz Chat Asszisztens - Rendszerterv (v2.0)

**Dátum:** 2026. március 25.
**Projekt:** chat_v1_Atlasz
**Típus:** White-label, dinamikusan tanuló AI asszisztens

## 1. Célkitűzés
Egy olyan Next.js alapú, könnyen testreszabható chat asszisztens létrehozása, amely képes lokális tudásbázisból (RAG) és beszélgetés közbeni interakciókból tanulni. A rendszer elsődleges nyelve a magyar, kiemelt funkciója az emberi minőségű hangalapú kommunikáció (OpenAI Nova).

## 2. Technológiai Stack
- **Frontend:** Next.js 15 (App Router), Tailwind CSS v4.
- **Backend:** Node.js (Vercel Serverless Functions).
- **Adattárolás:** SQLite (lokális fájl alapú) + Vektoros index (pl. `sqlite-vec` vagy pehelysúlyú JS könyvtár).
- **AI Motor:** OpenAI GPT-4o / GPT-4o-mini.
- **Beágyazás (Embedding):** OpenAI `text-embedding-3-small`.
- **Hang:** Web Speech API (STT) + OpenAI TTS API `nova` hanggal.
- **Webkeresés:** Tavily vagy Serper API integráció.

## 3. Kulcsfunkciók

### 3.1. Dinamikus Tanulás (Hibrid Memória)
- **Fájl Ingestion:** Chaten feltöltött PDF, TXT, MD fájlok azonnali szöveges feldolgozása, darabolása és vektoros tárolása.
- **Szemantikus Memória:** A beszélgetés során elhangzott fontos tények (pl. változó cégadatok) LLM általi felismerése és mentése egy dedikált táblába.

### 3.2. White-Label Testreszabás
- **Profil Konfiguráció:** Egy központi `config/profile.json` fájl segítségével az asszisztens neve, stílusa és az alapvető vállalati adatok (cég név, szlogen, elérhetőség) pillanatok alatt lecserélhetők.

### 3.3. Hangélmény
- **Magyar STT:** Gombnyomásra indítható, böngésző alapú magyar nyelvű diktálás.
- **Természetes TTS:** Az OpenAI `nova` hangján megszólaló magyar válaszok, automata vagy manuális felolvasási opcióval.

### 3.4. Intelligens Webkeresés
- Az asszisztens önállóan dönti el, ha a válaszhoz internetes keresés szükséges.
- A keresési eredményeket összeveti a belső tudásbázissal.

## 4. Adatfolyam (RAG Pipeline)
1. Felhasználói kérdés érkezése.
2. Vektorkeresés a dokumentumtárban és a ténytáblában.
3. Kontextus összeállítása (Profil adatok + Találatok + Keresési eredmények).
4. LLM válaszgenerálás magyar nyelven.
5. Szöveges megjelenítés + TTS hanggenerálás és lejátszás.

## 5. Telepítés és Karbantartás
- **Hordozhatóság:** A teljes `data/` és `config/` mappa másolásával az asszisztens tudása és identitása átvihető.
- **Verziókövetés:** Lokális fejlesztés és GitHub szinkronizáció.
