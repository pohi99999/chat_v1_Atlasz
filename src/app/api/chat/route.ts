import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { getEmbedding } from '../../../lib/embeddings';
import { config, getSystemPrompt } from '../../../lib/config';
import { searchWeb, shouldSearchWeb } from '../../../lib/search';

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
    void error; // Ténykinyerés hiba nem blokkolja a chat választ
  }
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Nincsenek üzenetek megadva' }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1].content;

    // 1. DB init
    await db.init();

    // 2. Embedding a RAG query-hez
    const queryEmbedding = await getEmbedding(lastMessage);

    // 3. Top 3 dokumentum + top 3 memória
    const relevantDocs = db.search(queryEmbedding, 'documents', 3);
    const relevantFacts = db.search(queryEmbedding, 'memories', 3);

    // 4. RAG kontextus összeállítása
    let contextText = '';

    if (relevantDocs.length > 0) {
      contextText += '\n\n### RELEVÁNS DOKUMENTUMOK A TUDÁSBÁZISBÓL:\n';
      contextText += relevantDocs.map(d => `- [${typeof d.metadata?.['source'] === 'string' ? d.metadata['source'] : 'ismeretlen'}]: ${d.text}`).join('\n\n');
    }

    if (relevantFacts.length > 0) {
      contextText += '\n\n### RELEVÁNS KORÁBBI TÉNYEK (AMIKRE EMLÉKSZEL):\n';
      contextText += relevantFacts.map(f => `- ${f.text}`).join('\n');
    }

    // 4b. Web keresés döntés
    const maxRagScore = relevantDocs[0]?.score ?? 0;
    if (await shouldSearchWeb(lastMessage, maxRagScore)) {
      const webResults = await searchWeb(lastMessage);
      if (webResults) {
        contextText += '\n\n### AKTUÁLIS WEB KERESÉS EREDMÉNYE:\n' + webResults;
      }
    }

    // 5. System prompt összeállítás
    const personalityPrompt = await getSystemPrompt();
    const SYSTEM_PROMPT = `Te vagy ${config.name}, a(z) ${config.company} dedikált asszisztense.
Szlogened: "${config.slogan}"
Fő képességeid: ${config.capabilities.join(', ')}

${personalityPrompt}
${contextText}
`;

    // 6. OpenAI streaming
    const openaiStream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
      ],
      stream: true,
    });

    let fullReply = '';

    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of openaiStream) {
            const text = chunk.choices[0]?.delta?.content ?? '';
            if (text) {
              fullReply += text;
              controller.enqueue(encoder.encode(text));
            }
          }
        } finally {
          // 7. Háttér ténykinyerés – a teljes válasz rendelkezésre áll
          void Promise.all([
            extractAndSaveFact(lastMessage, 'user-extraction'),
            extractAndSaveFact(fullReply, 'assistant-extraction'),
          ]);
          controller.close();
        }
      }
    });

    return new Response(readableStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Szerver hiba';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
