import OpenAI from 'openai';
import { config } from '../../../lib/config.js';

export const runtime = 'nodejs';
export const maxDuration = 60; // A hanggenerálás is tarthat tovább

const openai = new OpenAI();

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return new Response('Missing text parameter', { status: 400 });
    }

    // OpenAI TTS hívás, ami arrayBuffert vagy streamet ad vissza
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: config.voice as any || 'nova', // A config alapján a 'nova' az alapértelmezés
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    return new Response(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error: any) {
    console.error('TTS Hiba:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
