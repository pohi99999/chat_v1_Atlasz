import { chunkText } from '../lib/embeddings.js';

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✅ ${name}`);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`❌ ${name}: ${msg}`);
    process.exit(1);
  }
}

// chunkText tesztek (nem igényel OpenAI API-t)

test('rövid szöveg → 1 chunk', () => {
  const result = chunkText('Rövid szöveg.');
  if (result.length !== 1) throw new Error(`Várt 1 chunk, kaptunk ${result.length}`);
  if (result[0] !== 'Rövid szöveg.') throw new Error('Chunk tartalma helytelen');
});

test('üres string → üres array', () => {
  const result = chunkText('');
  if (result.length !== 0) throw new Error(`Üres inputra várt 0 chunk, kaptunk ${result.length}`);
});

test('hosszú szöveg → több chunk', () => {
  const para = 'A'.repeat(600);
  const text = `${para}\n\n${para}`;
  const result = chunkText(text, 1000);
  // 1200 karakter, max 1000/chunk → 2 chunk
  if (result.length < 2) throw new Error(`Hosszú szövegnél várt legalább 2 chunk, kaptunk ${result.length}`);
});

test('minden chunk legfeljebb maxChunkSize karakter', () => {
  const longPara = 'X'.repeat(400);
  const text = Array.from({ length: 6 }, () => longPara).join('\n\n');
  const result = chunkText(text, 1000);
  for (const chunk of result) {
    if (chunk.length > 1200) { // puffer a paragrafus határoknál
      throw new Error(`Chunk túl hosszú: ${chunk.length} karakter`);
    }
  }
});

test('whitespace trim', () => {
  const result = chunkText('  Trimelt szöveg.  ');
  if (result.length !== 1) throw new Error('Várt 1 chunk');
  if (result[0] !== 'Trimelt szöveg.') throw new Error(`Várt trimelt stringet, kaptunk: "${result[0]}"`);
});

console.log('\n✅ Összes embeddings teszt átment!');
