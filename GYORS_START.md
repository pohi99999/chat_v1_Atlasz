# ⚡ Gyors Start Útmutató

## 🚀 3 Lépésben Indítsd El

### 1️⃣ Telepítés

```bash
# PowerShell (Windows)
$env:SKIP_AGENT_INSTALL=1; npm install

# Bash (Linux/Mac)
SKIP_AGENT_INSTALL=1 npm install
```

### 2️⃣ API Kulcs Beállítása

Hozz létre egy `.env.local` fájlt a projekt gyökerében:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

**Hol szerezhetsz API kulcsot?**
👉 https://platform.openai.com/api-keys

### 3️⃣ Indítás

```bash
npm run dev
```

Nyisd meg: **http://localhost:3000** 🎉

---

## 🌐 Vercel Deployment

### 1️⃣ GitHub Push

```bash
git add .
git commit -m "Atlas AI Chatbot ready"
git push
```

### 2️⃣ Vercel Import

1. Menj a https://vercel.com
2. Kattints: **"New Project"**
3. Import GitHub repository
4. Add meg az **Environment Variable**-t:
   - Key: `OPENAI_API_KEY`
   - Value: `sk-your-key-here`
5. Kattints: **"Deploy"**

Kész! 🚀

---

## 🆘 Gyakori Hibák

### ❌ "OPENAI_API_KEY is not set"

**Megoldás:**
```bash
# Ellenőrizd a .env.local fájlt
cat .env.local

# Győződj meg róla, hogy létezik és tartalmazza:
OPENAI_API_KEY=sk-...
```

### ❌ "npm install" hiba (Python agent)

**Megoldás:**
```bash
# Hagyd ki a Python agent telepítését
$env:SKIP_AGENT_INSTALL=1; npm install
```

### ❌ Chatbot nem válaszol

**Megoldás:**
1. Nyisd meg a böngésző konzolt (F12)
2. Ellenőrizd a Network tab-ot
3. Nézd meg a `/api/copilotkit` hívást
4. Ellenőrizd az API kulcsot

### ❌ React hibák

**Megoldás:**
```bash
# Tiszta újratelepítés
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 További Dokumentáció

- **TELEPITES.md** - Részletes telepítési útmutató
- **ENV_SETUP.md** - Környezeti változók
- **JAVITASOK.md** - Technikai részletek
- **OSSZEFOGLALO.md** - Teljes elemzés
- **README.md** - Angol dokumentáció

---

## ✅ Ellenőrző Lista

- [ ] Node.js 18+ telepítve
- [ ] npm install lefutott
- [ ] .env.local létrehozva
- [ ] OPENAI_API_KEY beállítva
- [ ] npm run dev lefutott
- [ ] http://localhost:3000 megnyílt
- [ ] Chatbot válaszol

Ha minden ✅, akkor kész vagy! 🎉

---

**Gyors Segítség:**
- 📖 Olvasd el: `TELEPITES.md`
- 🔧 Környezeti változók: `ENV_SETUP.md`
- 🐛 Hibakeresés: `OSSZEFOGLALO.md`

**Élvezd az Atlas AI-t!** 🤖✨

