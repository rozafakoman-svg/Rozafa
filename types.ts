
export type Language = 'geg' | 'eng';

// Added missing VaultStatus type to fix import errors in App.tsx and AdminDashboard.tsx
export type VaultStatus = 'quantum_secure' | 'locked';

// Central navigation state management
export type View = 'dictionary' | 'glossary' | 'thesaurus' | 'history' | 'podcast' | 'blog' | 'support' | 'community' | 'shop' | 'interjections' | 'alphabet' | 'forum' | 'admin' | 'map' | 'faq';

export type ModuleSettings = Record<string, boolean>;

export interface ExampleSentence {
  original: string;
  standard: string;
  translation: string;
}

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  pronunciationNote?: string;
  partOfSpeech: string;
  definitionEnglish: string;
  definitionStandard: string;
  etymology?: string;
  frequency: number;
  usageNote: string;
  synonyms: string[];
  antonyms: string[];
  examples: ExampleSentence[];
  relatedWords?: string[];
  relatedPhrases?: string[];
  customAudio?: string;
  status?: 'pending' | 'approved';
  source?: 'ai' | 'user' | 'bulk';
  authorId?: string;
  lastSyncedAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  level: number;
  levelTitle: string;
  levelTitleGeg: string;
  points: number;
  nextLevelPoints: number;
  badges: Badge[];
  contributions: number;
  joinedDate: string;
  tier?: string;
  mfaEnabled?: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface CrosswordData {
  title: string;
  width: number;
  height: number;
  words: {
    word: string;
    clue: string;
    startX: number;
    startY: number;
    direction: string;
  }[];
}

export interface AlphabetData {
  letter: string;
  word: string;
  translation: string;
  pronunciation: string;
  exampleSentence: string;
  imagePrompt: string;
}

export interface GlossaryTerm {
  word: string;
  definition: string;
  partOfSpeech: string;
  origin?: string;
}

export type ContributionType = 'add_word' | 'suggest_edit' | 'report_error';

export interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  duration: string;
  date: string;
  topic: string;
  isLive?: boolean;
  comments: PodcastComment[];
  host?: string;
}

export interface PodcastComment {
  id: string;
  user: string;
  content: string;
  timestamp: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  timestamp: number;
  readTime: string;
  tags: string[];
  imageUrl?: string;
  imagePrompt?: string;
}

export interface Badge {
  id: string;
  name: string;
  nameGeg: string;
  iconName: string;
  description: string;
  descriptionGeg: string;
  color: string;
  earned: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  tier: string;
  method: 'stripe' | 'paypal';
  timestamp: string;
}

export interface Product {
  id: string;
  name: string;
  nameGeg: string;
  description: string;
  price: number;
  category: string;
  imageIcon: string;
  imageUrl?: string;
  imagePrompt?: string;
  color?: string;
  rating?: number;
  reviews?: number;
}

export interface SecurityAudit {
  id: string;
  event: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

export interface SystemLog {
  id: string;
  message: string;
  timestamp: string;
  type: 'info' | 'error' | 'warning';
}

export interface InterjectionEntry {
  word: string;
  origin: string;
  meaning: string;
  usage: string;
  example: string;
  tags: string[];
}

export interface AlphabetLetter {
  id: string;
  char: string;
  isNasal: boolean;
  isDigraph: boolean;
  ipa: string;
  exampleWord: string;
  exampleTranslation: string;
  description: string;
  imageUrl?: string;
  audioUrl?: string;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorRole?: 'admin' | 'moderator' | 'user';
  date: string;
  upvotes: number;
  downvotes: number;
  tags: string[];
  comments: ForumComment[];
  viewCount: number;
  pinned?: boolean;
}

export interface ForumComment {
  id: string;
  postId: string;
  author: string;
  content: string;
  date: string;
  upvotes: number;
  role?: 'admin' | 'moderator' | 'user';
}

export interface GameScore {
  id: string;
  name: string;
  score: number;
  date: string;
  mode: 'zen' | 'challenge';
}
