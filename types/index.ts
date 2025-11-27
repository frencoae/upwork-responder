// types/index.ts - UPDATED
export interface User {
  id: number;
  email: string;
  name: string;
  company_name?: string;
  timezone?: string;
  profile_photo?: string;
  subscription_plan?: string;
  created_at: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  budget: string;
  postedDate: string;
  client: {
    name: string;
    rating: number;
    country: string;
    totalSpent: number;
    totalHires: number;
  };
  skills: string[];
  proposals: number;
  verified: boolean;
  category?: string;
  duration?: string;
}

export interface ProposalTemplate {
  id: string;
  title: string;
  content: string;
}

export interface PromptSettings {
  basicInfo: {
    feedName: string;
    keywords: string;
    specialty: string;
    provisions: string;
    hourlyRate: string;
    location: string;
  };
  validationRules: {
    minBudget: number;
    maxBudget: number;
    jobTypes: string[];
    clientRating: number;
    requiredSkills: string[];
    validationPrompt: string;
  };
  proposalTemplates: ProposalTemplate[];
  aiSettings: {
    model: string;
    temperature: number;
    maxTokens: number;
    creativity: 'low' | 'medium' | 'high';
  };
}