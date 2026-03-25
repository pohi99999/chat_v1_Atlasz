import fs from 'fs/promises';
import path from 'path';

export interface VectorRecord {
  id: string;
  text: string;
  embedding: number[];
  metadata?: Record<string, any>;
}

export interface VectorDatabase {
  documents: VectorRecord[];
  memories: VectorRecord[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DOCS_FILE = path.join(DB_DIR, 'documents.json');
const MEMORIES_FILE = path.join(DB_DIR, 'memories.json');

class LocalVectorDB {
  public documents: VectorRecord[] = [];
  public memories: VectorRecord[] = [];

  async init() {
    try {
      await fs.mkdir(DB_DIR, { recursive: true });
      
      this.documents = await this.loadTable(DOCS_FILE);
      this.memories = await this.loadTable(MEMORIES_FILE);
    } catch (error) {
      console.error('Failed to init DB:', error);
    }
  }

  private async loadTable(filepath: string): Promise<VectorRecord[]> {
    try {
      const data = await fs.readFile(filepath, 'utf-8');
      return JSON.parse(data);
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        // Create empty file if not exists
        await fs.writeFile(filepath, '[]', 'utf-8');
        return [];
      }
      throw err;
    }
  }

  async saveDocuments() {
    await fs.writeFile(DOCS_FILE, JSON.stringify(this.documents, null, 2), 'utf-8');
  }

  async saveMemories() {
    await fs.writeFile(MEMORIES_FILE, JSON.stringify(this.memories, null, 2), 'utf-8');
  }

  // Cosine similarity between two vectors
  cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  search(queryEmbedding: number[], table: 'documents' | 'memories', topK: number = 3) {
    const records = table === 'documents' ? this.documents : this.memories;
    
    const scored = records.map(record => ({
      ...record,
      score: this.cosineSimilarity(queryEmbedding, record.embedding)
    }));

    return scored.sort((a, b) => b.score - a.score).slice(0, topK);
  }
}

export const db = new LocalVectorDB();
