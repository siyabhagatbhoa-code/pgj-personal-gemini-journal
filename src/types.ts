export type PersonaId = 'sage' | 'friend' | 'philosopher' | 'coach';

export type AuraToneId = 'Dawn Lavender' | 'Serene Peach' | 'Aurora Mist' | 'Celestial Sky';

export interface UserSanctuaryProfile {
  uid: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  moniker?: string;
  avatarUrl?: string;
  persona: PersonaId;
  auraTone: AuraToneId;
  philosophy?: string;
  pronouns?: string;
  cadence?: string;
  depth?: 'Brief Clarification' | 'Balanced' | 'Profound Contemplation';
  audioChime?: boolean;
  proactivePrompts?: boolean;
  voiceSynthesis?: boolean;
  pillars?: string[];
  reflectionsCount?: number;
  dayStreak?: number;
  stillnessHours?: number;
  updatedAt?: any;
}

export interface JournalMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  timestamp: any; // Firestore Timestamp or serialized
  createdAt: any;
  updatedAt: any;
  moodTag: string;
  persona: PersonaId;
  messages: JournalMessage[];
}

export type ActiveScreen = 'home' | 'chat' | 'past-entries' | 'settings' | 'edit-profile' | 'onboarding' | 'auth';

export interface PersonaConfig {
  id: PersonaId;
  name: string;
  tagline: string;
  description: string;
  sampleQuote: string;
  badge: string;
  iconName: string;
  badgeColorClass: string;
}
