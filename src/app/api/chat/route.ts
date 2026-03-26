import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { db } from '../../../lib/db.js';
import { getEmbedding } from '../../../lib/embeddings.js';
import { config, getSystemPrompt } from '../../../lib/config.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const openai = new OpenAI();

async function extractAndSaveFact(
  message: string,
  source: 'user-extraction' | 'assistant-extraction' = 'user-extraction'
) {
  if (!message.trim()) return;
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

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Nincsenek üzenetek megadva' }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1].content;

    // 1. Inicializáljuk a lokális DB-t
    await db.init();

    // 2. Szerezzük meg az utolsó üzenet vektorát (RAG query)
    const queryEmbedding = await getEmbedding(lastMessage);

    // 3. Keressük meg a top 3 dokumentumot és top 3 tényt
    const relevantDocs = db.search(queryEmbedding, 'documents', 3);
    const relevantFacts = db.search(queryEmbedding, 'memories', 3);

    // 4. Állítsuk össze a RAG kontextust
    let contextText = '';
    
    if (relevantDocs.length > 0) {
      contextText += '\n\n### RELEVÁNS DOKUMENTUMOK A TUDÁSBÁZISBÓL:\n';
      contextText += relevantDocs.map(d => `- [${d.metadata?.source || 'ismeretlen'}]: ${d.text}`).join('\n\n');
    }

    if (relevantFacts.length > 0) {
      contextText += '\n\n### RELEVÁNS KORÁBBI TÉNYEK (AMIKRE EMLÉKSZEL):\n';
      contextText += relevantFacts.map(f => `- ${f.text}`).join('\n');
    }

    // 5. Állítsuk össze a System Prompt-ot a config-ból
    const personalityPrompt = await getSystemPrompt();
    const SYSTEM_PROMPT = `Te vagy ${config.name}, a(z) ${config.company} dedikált asszisztense.
Szlogened: "${config.slogan}"
Fő képességeid: ${config.capabilities.join(', ')}

${personalityPrompt}
${contextText}
`;

    // 6. OpenAI Válaszgenerálás (előbb kell, hogy az AI választ is feldolgozhassuk)
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
    void Promise.all([
      extractAndSaveFact(lastMessage, 'user-extraction'),
      extractAndSaveFact(reply, 'assistant-extraction'),
    ]);

    return NextResponse.json({ reply });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Szerver hiba';
    console.error('Chat API Hiba:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
