
export type Language = 'geg' | 'eng';

// Added View type for central navigation state management across components
export type View = 'dictionary' | 'glossary' | 'thesaurus' | 'history' | 'podcast' | 'blog' | 'support' | 'community' | 'shop' | 'interjections' | 'alphabet' | 'forum' | 'admin' | 'map';

export interface ExampleSentence {
  original: string;
  standard: string;
  translation: string;
}

export interface DictionaryEntry {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definitionEnglish: string;
  definitionStandard: string;
  etymology: string;
  etymologyImage?: string; // AI-generated illustration of origin
  frequency?: number; // 0 to 100 hypothetical use frequency
  usageNote?: string; // Short context about how often it's used
  synonyms: string[];
  antonyms?: string[];
  relatedWords?: string[];
  relatedPhrases?: string[];
  examples: ExampleSentence[];
  culturalNote?: string;
  dialectRegion?: string;
  grammarNotes?: string[];
  customAudio?: string; 
  pronunciationNote?: string;
  isSealed?: boolean; // Security: entries can be sealed/encrypted
}

// Security & Compliance Types
export interface SecurityAudit {
  id: string;
  timestamp: string;
  event: string;
  status: 'passed' | 'warning' | 'failed';
  operator: string;
  details: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'secure' | 'danger';
  message: string;
  action: string;
  immutableHash: string; // Proof of integrity
}

export type VaultStatus = 'locked' | 'unlocked' | 'sealing' | 'quantum_secure';

export interface GlossaryTerm {
  word: string;
  definition: string;
  partOfSpeech: string;
  origin?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; 
  explanation: string;
}

export interface SearchState {
  isLoading: boolean;
  error: string | null;
  data: DictionaryEntry | null;
}

export interface CrosswordWord {
  word: string;
  clue: string;
  startX: number;
  startY: number;
  direction: 'across' | 'down';
}

export interface CrosswordData {
  title: string;
  width: number;
  height: number;
  words: CrosswordWord[];
}

export interface AlphabetData {
  letter: string;
  word: string;
  translation: string;
  pronunciation: string;
  exampleSentence: string;
  imagePrompt: string;
}

export interface AlphabetLetter {
  id: string;
  char: string;
  isNasal: boolean; 
  isDigraph: boolean; 
  ipa: string;
  exampleWord: string;
  exampleTranslation: string;
  audioUrl?: string;
  imageUrl?: string; 
  description: string; 
}

export interface GameScore {
    id: string;
    name: string;
    score: number;
    date: string;
    mode: 'zen' | 'challenge';
}

export interface PodcastComment {
  id: string;
  user: string;
  content: string;
  timestamp: string;
}

export interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  duration: string;
  date: string;
  topic: string; 
  audioUrl?: string; 
  isLive?: boolean;
  comments: PodcastComment[];
  host?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string; 
  author: string;
  date: string;
  readTime: string;
  tags: string[];
  imageUrl?: string;
}

export interface ForumComment {
  id: string;
  postId: string;
  author: string;
  role?: 'admin' | 'moderator' | 'user';
  content: string;
  date: string;
  upvotes: number;
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

export type ContributionType = 'report_error' | 'suggest_edit' | 'add_word';

export interface PendingContribution {
  id: string;
  type: ContributionType;
  user: string;
  word?: string;
  details: string; 
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
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

export interface UserProfile {
  id: string;
  name: string;
  email: string; 
  role: string;
  tier?: string; 
  level: number;
  levelTitle: string;
  levelTitleGeg: string;
  points: number;
  nextLevelPoints: number;
  badges: Badge[];
  contributions: number;
  joinedDate: string;
  mfaEnabled?: boolean;
  lastLoginSecurityAudit?: string;
}

export interface Product {
  id: string;
  name: string;
  nameGeg: string;
  description: string;
  price: number;
  category: 'souvenir' | 'digital' | 'apparel' | 'corporate';
  imageIcon: string; 
  color: string;
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

export interface FinancialRecord {
  month: string;
  revenue: number; 
  expenses: number; 
  profit: number; 
  transactions: number;
}

export interface InterjectionEntry {
  word: string;
  origin: 'Turkish' | 'Slavic' | 'Latin/Italian' | 'International/Albanized' | 'Native Geg';
  meaning: string;
  usage: string;
  example: string;
  tags: string[];
}