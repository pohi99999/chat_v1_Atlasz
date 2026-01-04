# Környezeti Változók Beállítása

## Next.js Alkalmazás (.env.local)

Hozz létre egy `.env.local` fájlt a projekt gyökerében:

```env
# Kötelező: OpenAI API kulcs
OPENAI_API_KEY=sk-your-openai-api-key-here

# Opcionális: Modell kiválasztása (alapértelmezett: gpt-4o)
OPENAI_MODEL=gpt-4o

# Opcionális: Fejlesztői konzol engedélyezése
NEXT_PUBLIC_COPILOTKIT_DEV_CONSOLE=false

# Node környezet
NODE_ENV=development
```

## Python Agent (agent/.env)

Ha a Python agent-et is használni szeretnéd, hozz létre egy `.env` fájlt az `agent` mappában:

### OpenAI használata:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_CHAT_MODEL_ID=gpt-4o-mini
```

### Azure OpenAI használata:

```env
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_CHAT_DEPLOYMENT_NAME=gpt-4o-mini
# Opcionális, ha nem az login-t használod:
# AZURE_OPENAI_API_KEY=...
```

## Vercel Deployment

A Vercel-en állítsd be a következő környezeti változókat:

**Project Settings → Environment Variables:**

1. `OPENAI_API_KEY` - Az OpenAI API kulcsod
2. `OPENAI_MODEL` - (Opcionális) Alapértelmezett: `gpt-4o`
3. `NEXT_PUBLIC_COPILOTKIT_DEV_CONSOLE` - (Opcionális) `true` vagy `false`

**Fontos:** A Python agent NEM fog működni Vercel serverless környezetben!

## Biztonsági Megjegyzések

- ⚠️ SOHA ne commitold a `.env` vagy `.env.local` fájlokat a Git-be!
- ⚠️ Az API kulcsokat tartsd titokban
- ✅ Használj különböző API kulcsokat fejlesztéshez és production-höz
- ✅ Forgasd rendszeresen az API kulcsokat

