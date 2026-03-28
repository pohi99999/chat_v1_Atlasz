# Streaming Válaszok – Design Spec

**Dátum:** 2026-03-28
**Projekt:** Nova_assisst (Atlasz AI Chat)
**Típus:** Feature – valós idejű szöveggenerálás streaming-gel

---

## Célkitűzés

Az AI válasz szövege megjelenjen azonnal, ahogy az OpenAI generálja – ne kelljen megvárni a teljes választ. A felhasználó látja, ahogy a szöveg íródik, mint a ChatGPT-ben.

---

## Backend – `src/app/api/chat/route.ts`

### Mi marad

A teljes pipeline (DB init, embedding, RAG keresés, web search döntés, system prompt összeállítás) **változatlan**. A `maxDuration = 60` marad.

### Mi változik

**OpenAI hívás:** `stream: false` → `stream: true`

```ts
const stream = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages
  ],
  stream: true,
});
```

**Visszaadás:** `ReadableStream` raw text-ként, nem JSON:

```ts
let fullReply = '';

const readableStream = new ReadableStream({
  async start(controller) {
    const encoder = new TextEncoder();
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content ?? '';
      if (text) {
        fullReply += text;
        controller.enqueue(encoder.encode(text));
      }
    }
    // Stream végén: háttér ténykinyerés (változatlan)
    void Promise.all([
      extractAndSaveFact(lastMessage, 'user-extraction'),
      extractAndSaveFact(fullReply, 'assistant-extraction'),
    ]);
    controller.close();
  }
});

return new Response(readableStream, {
  headers: { 'Content-Type': 'text/plain; charset=utf-8' },
});
```

**Hibaellenőrzés:** Ha a stream feldolgozása közben kivétel keletkezik, a `controller.error(err)` hívja le a streamet. A frontend stream-olvasó ezt kezeli.

---

## Frontend – `src/app/components/ChatInterface.tsx`

### `handleSubmit` változások

A jelenlegi flow:
```
fetch → await res.json() → setMessages([...reply])
```

Új flow:
```
fetch → üres AI buborék hozzáadása → stream olvasás (chunk-onként update) → TTS a teljes szöveggel
```

**Részletek:**
1. `isLoading` true marad amíg az első chunk meg nem érkezik
2. Üzenet küldésekor azonnal bekerül egy `{ role: "assistant", content: "", time: now() }` buborék
3. `res.body.getReader()` + `TextDecoder` – chunk-onként `fullReply` pufferbe és setMessages update
4. `isLoading = false` az első chunk után (a bouncing dots eltűnnek)
5. Stream végén: `speakNova(fullReply)` hívása

**Loading UX:**
- Amíg az első chunk nem jött: bouncing dots (meglévő `isLoading` indicator)
- Első chunk után: a buborék szövege jelenik meg és növekszik

---

## Érintett fájlok

| Fájl | Változás |
|------|---------|
| `src/app/api/chat/route.ts` | stream: true, ReadableStream visszaadás, fullReply puffer |
| `src/app/components/ChatInterface.tsx` | stream olvasás, incremental message update |

---

## Nem változik

- RAG pipeline logika
- Web search logika
- Ténykinyerés (background, stream végén fut)
- TTS (stream végén hívódik, teljes szöveggel)
- Memory betöltés, file upload, STT
- `maxDuration = 60` (elegendő)
