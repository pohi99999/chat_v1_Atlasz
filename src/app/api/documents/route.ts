import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export interface DocumentSummary {
  source: string;
  count: number;
  lastAdded: string;
}

export async function GET() {
  try {
    await db.init();
    const docs = await db.getTable('documents');

    // Csoportosítás forrás szerint
    const sourceMap = new Map<string, { count: number; lastAdded: string }>();
    for (const doc of docs) {
      const source = typeof doc.metadata?.['source'] === 'string' ? doc.metadata['source'] : 'ismeretlen';
      const createdAt = typeof doc.metadata?.['createdAt'] === 'string' ? doc.metadata['createdAt'] : '';
      const existing = sourceMap.get(source);
      if (!existing) {
        sourceMap.set(source, { count: 1, lastAdded: createdAt });
      } else {
        existing.count++;
        if (createdAt > existing.lastAdded) existing.lastAdded = createdAt;
      }
    }

    const documents: DocumentSummary[] = Array.from(sourceMap.entries()).map(([source, info]) => ({
      source,
      count: info.count,
      lastAdded: info.lastAdded,
    }));

    return NextResponse.json({ documents, totalChunks: docs.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Szerver hiba';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await db.init();
    const docs = await db.getTable('documents');
    for (const doc of docs) {
      await db.deleteRecord('documents', doc.id);
    }
    return NextResponse.json({ success: true, deleted: docs.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Szerver hiba';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
