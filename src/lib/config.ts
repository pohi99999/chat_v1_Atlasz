import profile from '../config/profile.json';

export interface AssistantProfile {
  name: string;
  company: string;
  slogan: string;
  capabilities: string[];
  voice: string;
}

export const config: AssistantProfile = profile;
