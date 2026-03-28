import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await db.init();
    const { id } = await params;

    const index = db.memories.findIndex((m) => m.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Nem található' }, { status: 404 });
    }

    db.memories.splice(index, 1);
    await db.saveMemories();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Szerver hiba';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
