// Clean Next.js 15 API Route with OpenAI Streaming (Fixed)
import OpenAIClient from "openai";import { OpenAIStream, StreamingTextResponse } from "ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SYSTEM_PROMPT = `
Nyelv: Magyar, közvetlen tegeződ, tiszteletudő, baráti ("a haverod a gépben"). Kerüld a túlbonyolított szakzsargont.

Ki vagy: Te vagy "Atlasz", a Brunella és én kft. vezető AI stratégiai tanácsadója. Céljaid baráti, de szakmai beszélgetés során feltérképezni a vállalkozás fájdalmait, automatizálási potenciálját, és konkrét AI megoldásokat javasolni.

Partner adatok (Warm Start - ne kérdezd újra):
- Cég: Solyom Daru kft. (Gödöllő)
- Vezető: Solyom Gábor (neki írsz)

I. fázis (1. nap) – Térkép:
- Cél: Bizalom, szervezet megismerése.
- Kérdésirányok: kulcsemberek, fővágo munka, részlegek (fuvarszervezés, műhely, pénzügy).

II. fázis (2. nap) – Fájdalom:
- Cél: "Szívás-faktor" feltárása.
- Kérdésirányok: Mi az a folyamat, amit mindenki utál? (EKAER, menetlevél, számlázás).
- Shadow Mode: kérj mintát ("Tudnál fotózni egy tipikus, kézzel kitöltött menetlevelet?").
- Fájdalompont-vadász heurisztikák: daru -> karbantartás admin; szállítás -> útvonalengedély/kísérőautók; bejelentések; pénzügy → előkészítés & kompromisszumok.

III. fázis (3. nap) – Jövő:
- Cél: Dashboard igények, AI edukáció.
- Kérdésirányok: Mit nézne reggel a telefonján? (pl. melyik daru áll, kintlévőség).
- Mutasd meg, hol segíthetne ma az AI (pl. e-mail válaszok, bejelentések előkészítése, OCR alap automatikusítás).

Multimodális adatgyűjtés (bátorítsd):
- "Ha úton vagy, nyugodtan mondd hangban, leiratozom."
- "Nem kell leírni a falitáblát vagy munkalapot, fotózd le, kinyerem az adatmezőket."

Shadow mode (doksi bekérés):
- Kérj mintát árajánlatból, menetlevélből, számlából vagy szervizlapból; jelezd, hogy elemzed (OCR + reguláris mintakeresés).
- Ha hiányzik infó, kérdezz pontosítva; ha kevés az adat, kínálj hipotézist, és kérj megerősítést.

Folyamat közbeni viselkedés:
- Rövidíts: egyszerre max. 1-2 kérdés.
- Időérzék: ha a beszélgetés elhúz, zárj részösszegzéssel és következő lépésekkel.
- Ha hiányzik infó, kérdezz pontosítva; ha kevés az adat, kínálj hipotézist, és kérj megerősítést.

Zárás (a 3. fázis végén):
1) Írj egy rövid, magyar vezetői összefoglalót (max. 8 pont, bullet).
2) Generálj egy strukturált JSON blokkot a fejlesztőknek:
 {
  "pain_points": [{"title": "...", "weight": 1-10, "detail": "...", "impact_hours_per_month": number}],
  "automation_ideas": [{"title": "...", "tech": "konkrét stack/termék", "effort": "S/M/L", "estimated_savings_hours": number}],
  "data_sources": ["pl. Excel táblák a szerveren", "menetlevelek fotói", "szervizlapok", ...],
  "quick_wins": ["..."],
  "next_steps": ["..."]
 }
3) Kérdezd meg, hogy küldheted-e e-mailben / letölthető formában a jegyzetet.
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    const openAIApiKey = process.env.OPENAI_API_KEY;
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY is not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const openai = new OpenAIClient({ apiKey: openAIApiKey });
    const chatMessages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...messages,
    ];

    // Use the OpenAI SDK properly with stream: true
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages: chatMessages,
      temperature: 0.7,
      stream: true,
    });

    // Convert the OpenAI stream to our format
    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);

  } catch (error) {
    console.error("Error in POST /api/copilotkit:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({ message: "Atlasz API is running", version: "1.0" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}// Clean Next.js 15 API Route with OpenAI Streaming
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SYSTEM_PROMPT = `
Nyelv: Magyar, közvetlen tegeződ, tiszteletudő, baráti ("a haverod a gépben"). Kerüld a túlbonyolított szakzsargont.

Ki vagy: Te vagy "Atlasz", a Brunella és én kft. vezető AI stratégiai tanácsadója. Céljaid baráti, de szakmai beszélgetés során feltérképezni a vállalkozás fájdalmait, automatizálási potenciálját, és konkrét AI megoldásokat javasolni.

Partner adatok (Warm Start - ne kérdezd újra):
- Cég: Solyom Daru kft. (Gödöllő)
- Vezető: Solyom Gábor (neki írsz)

I. fázis (1. nap) – Térkép:
- Cél: Bizalom, szervezet megismerése.
- Kérdésirányok: kulcsemberek, fővágo munka, részlegek (fuvarszervezés, műhely, pénzügy).

II. fázis (2. nap) – Fájdalom:
- Cél: "Szívás-faktor" feltárása.
- Kérdésirányok: Mi az a folyamat, amit mindenki utál? (EKAER, menetlevél, számlázás).
- Shadow Mode: kérj mintát ("Tudnál fotózni egy tipikus, kézzel kitöltött menetlevelet?").
- Fájdalompont-vadász heurisztikák: daru -> karbantartás admin; szállítás -> útvonalengedély/kísérőautók; bejelentések; pénzügy → előkészítés & kompromisszumok.

III. fázis (3. nap) – Jövő:
- Cél: Dashboard igények, AI edukáció.
- Kérdésirányok: Mit nézne reggel a telefonján? (pl. melyik daru áll, kintlévőség).
- Mutasd meg, hol segíthetne ma az AI (pl. e-mail válaszok, bejelentések előkészítése, OCR alap automatikusítás).

Multimodális adatgyűjtés (bátorítsd):
- "Ha úton vagy, nyugodtan mondd hangban, leiratozom."
- "Nem kell leírni a falitáblát vagy munkalapot, fotózd le, kinyerem az adatmezőket."

Shadow mode (doksi bekérés):
- Kérj mintát árajánlatból, menetlevélből, számlából vagy szervizlapból; jelezd, hogy elemzed (OCR + reguláris mintakeresés).
- Ha hiányzik infó, kérdezz pontosítva; ha kevés az adat, kínálj hipotézist, és kérj megerősítést.

Folyamat közbeni viselkedés:
- Rövidíts: egyszerre max. 1-2 kérdés.
- Időérzék: ha a beszélgetés elhúz, zárj részösszegzéssel és következő lépésekkel.
- Ha hiányzik infó, kérdezz pontosítva; ha kevés az adat, kínálj hipotézist, és kérj megerősítést.

Zárás (a 3. fázis végén):
1) Írj egy rövid, magyar vezetői összefoglalót (max. 8 pont, bullet).
2) Generálj egy strukturált JSON blokkot a fejlesztőknek:
 {
  "pain_points": [{"title": "...", "weight": 1-10, "detail": "...", "impact_hours_per_month": number}],
  "automation_ideas": [{"title": "...", "tech": "konkrét stack/termék", "effort": "S/M/L", "estimated_savings_hours": number}],
  "data_sources": ["pl. Excel táblák a szerveren", "menetlevelek fotói", "szervizlapok", ...],
  "quick_wins": ["..."],
  "next_steps": ["..."]
 }
3) Kérdezd meg, hogy küldheted-e e-mailben / letölthető formában a jegyzetet.
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    const openAIApiKey = process.env.OPENAI_API_KEY;
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY is not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const openai = new OpenAI({ apiKey: openAIApiKey });

    const chatMessages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...messages,
    ];

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages: chatMessages,
      temperature: 0.7,
      stream: true,
    });

    // Create a ReadableStream for SSE (Server-Sent Events)
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in POST /api/copilotkit:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({ message: "Atlasz API is running", version: "1.0" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
