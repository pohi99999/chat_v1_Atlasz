import { NextResponse } from 'next/server';
import { db } from '../../../lib/db.js';
import { getEmbedding, chunkText } from '../../../lib/embeddings.js';
import pdfParse from 'pdf-parse';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const text = formData.get('text') as string | null;

    let contentToProcess = '';

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      
      if (file.name.endsWith('.pdf')) {
        const parsed = await pdfParse(buffer);
        contentToProcess = parsed.text;
      } else {
        // Fallback for txt, md, etc.
        contentToProcess = buffer.toString('utf-8');
      }
    } else if (text) {
      contentToProcess = text;
    } else {
      return NextResponse.json({ error: 'No file or text provided' }, { status: 400 });
    }

    // Initialize DB to ensure it's loaded
    await db.init();

    // Chunk the text and generate embeddings
    const chunks = chunkText(contentToProcess);
    let addedChunks = 0;

    for (const chunk of chunks) {
      if (chunk.trim().length < 10) continue; // Skip too small chunks

      const embedding = await getEmbedding(chunk);
      db.documents.push({
        id: crypto.randomUUID(),
        text: chunk,
        embedding,
        metadata: {
          source: file ? file.name : 'text-input',
          createdAt: new Date().toISOString()
        }
      });
      addedChunks++;
    }

    // Save to disk
    await db.saveDocuments();

    return NextResponse.json({ 
      success: true, 
      message: `Successfully ingested ${addedChunks} chunks.`,
      filename: file?.name || 'text-input'
    });

  } catch (error: any) {
    console.error('Ingestion error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
