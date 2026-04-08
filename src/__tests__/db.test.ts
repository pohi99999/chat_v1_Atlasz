import { db } from '../lib/db.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

// Ideiglenes mappa, hogy ne szennyezzük a valós data/-t
const TMP_DIR = path.join(os.tmpdir(), `nova-db-test-${Date.now()}`);
const originalCwd = process.cwd();

async function setup() {
  await fs.mkdir(TMP_DIR, { recursive: true });
  process.chdir(TMP_DIR);
}

async function teardown() {
  process.chdir(originalCwd);
  await fs.rm(TMP_DIR, { recursive: true, force: true });
}

async function testDB() {
  // 1. init (a singleton most a TMP_DIR/data/-ba ír)
  await db.init();
  console.log('✅ init()');

  // 2. Üres táblák
  const docs0 = await db.getTable('documents');
  const mems0 = await db.getTable('memories');
  const threads0 = await db.getThreads();
  if (!Array.isArray(docs0) || docs0.length !== 0) throw new Error('documents nem üres array');
  if (!Array.isArray(mems0) || mems0.length !== 0) throw new Error('memories nem üres array');
  if (!Array.isArray(threads0) || threads0.length !== 0) throw new Error('threads nem üres array');
  console.log('✅ Üres táblák');

  // Teszt embedding (5 dimenziós egységvektor)
  const vec = [1, 0, 0, 0, 0];

  // 3. addRecord — document
  await db.addRecord('documents', {
    id: 'doc-1',
    text: 'Ez egy tesztdokumentum.',
    embedding: vec,
    metadata: { source: 'test.txt', createdAt: new Date().toISOString() }
  });
  const docs1 = await db.getTable('documents');
  if (docs1.length !== 1) throw new Error(`addRecord: várt 1, kaptunk ${docs1.length}`);
  console.log('✅ addRecord (document)');

  // 4. addRecord — memory
  await db.addRecord('memories', {
    id: 'mem-1',
    text: 'A felhasználó neve Péter.',
    embedding: vec,
    metadata: { source: 'user-extraction', createdAt: new Date().toISOString() }
  });
  const mems1 = await db.getMemories();
  if (mems1.length !== 1) throw new Error(`addRecord: várt 1 memory, kaptunk ${mems1.length}`);
  console.log('✅ addRecord (memory)');

  // 5. search — azonos vektor → score = 1.0
  const results = await db.search(vec, 'documents', 3);
  if (results.length !== 1) throw new Error(`search: várt 1 eredmény, kaptunk ${results.length}`);
  if (Math.abs(results[0].score - 1.0) > 0.001) throw new Error(`search score: várt ~1.0, kaptunk ${results[0].score}`);
  console.log('✅ search (cosine similarity)');

  // 6. upsert — meglévő id frissítése
  await db.addRecord('documents', {
    id: 'doc-1',
    text: 'Frissített tartalom.',
    embedding: vec,
    metadata: { source: 'test.txt', createdAt: new Date().toISOString() }
  });
  const docs2 = await db.getTable('documents');
  if (docs2.length !== 1) throw new Error('upsert duplikált rekordot hozott létre!');
  if (docs2[0].text !== 'Frissített tartalom.') throw new Error('upsert nem frissítette a szöveget');
  console.log('✅ upsert (record update)');

  // 7. deleteRecord
  await db.deleteRecord('documents', 'doc-1');
  const docs3 = await db.getTable('documents');
  if (docs3.length !== 0) throw new Error(`deleteRecord: várt 0, kaptunk ${docs3.length}`);
  console.log('✅ deleteRecord');

  // 8. Thread CRUD
  await db.saveThread('t-1', 'Teszt szál', [
    { id: 'm-1', role: 'user', content: 'Hello' },
    { id: 'm-2', role: 'assistant', content: 'Szia!' }
  ]);
  const thread = await db.getThread('t-1');
  if (!thread) throw new Error('saveThread sikertelen');
  if (thread.messages.length !== 2) throw new Error(`thread: várt 2 üzenet, kaptunk ${thread.messages.length}`);
  if (thread.title !== 'Teszt szál') throw new Error('thread title eltér');

  const list = await db.getThreads();
  if (list.length !== 1) throw new Error(`getThreads: várt 1, kaptunk ${list.length}`);
  console.log('✅ saveThread + getThread + getThreads');

  await db.deleteThread('t-1');
  const deleted = await db.getThread('t-1');
  if (deleted !== null) throw new Error('deleteThread sikertelen');
  console.log('✅ deleteThread');

  console.log('\n✅ Összes DB teszt átment! (9/9)');
}

(async () => {
  try {
    await setup();
    await testDB();
  } catch (error: unknown) {
    console.error('\n❌ DB teszt sikertelen:');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await teardown();
  }
})();
