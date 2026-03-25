import OpenAI from 'openai';

const openai = new OpenAI();

export async function getEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.replace(/\n/g, ' '),
  });

  return response.data[0].embedding;
}

export function chunkText(text: string, maxChunkSize: number = 1000): string[] {
  // A simple chunker based on paragraphs and character limit
  const paragraphs = text.split('\n\n');
  const chunks: string[] = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > maxChunkSize) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }
  
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}
