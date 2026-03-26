import fs from 'fs/promises';
import path from 'path';
import profile from '../config/profile.json';

export interface AssistantProfile {
  name: string;
  company: string;
  slogan: string;
  capabilities: string[];
  voice: string;
  accentColor: string;
  greeting: string;
}

export const config: AssistantProfile = profile;

export async function getSystemPrompt(): Promise<string> {
  const filePath = path.join(process.cwd(), 'src', 'config', 'system-prompt.md');
  return fs.readFile(filePath, 'utf-8');
}
