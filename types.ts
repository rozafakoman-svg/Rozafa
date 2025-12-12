
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
  synonyms: string[];
  antonyms?: string[];
  relatedWords?: string[];
  relatedPhrases?: string[];
  examples: ExampleSentence[];
  culturalNote?: string;
  dialectRegion?: string;
  grammarNotes?: string[];
  customAudio?: string; // URL/Blob for user uploaded audio
  pronunciationNote?: string;
}

export interface GlossaryTerm {
  word: string;
  definition: string;
  partOfSpeech: string;
  origin?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // index 0-3
  explanation: string;
}

export interface SearchState {
  isLoading: boolean;
  error: string | null;
  data: DictionaryEntry | null;
}

// Crossword Types
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

// Alphabet Game Types
export interface AlphabetData {
  letter: string;
  word: string;
  translation: string;
  pronunciation: string;
  exampleSentence: string;
  imagePrompt: string;
}

// Alphabet Reference Page Types
export interface AlphabetLetter {
  id: string;
  char: string;
  isNasal: boolean; // To highlight Geg specific nasals like Â
  isDigraph: boolean; // For Ll, Nj, Xh, etc.
  ipa: string;
  exampleWord: string;
  exampleTranslation: string;
  audioUrl?: string;
  imageUrl?: string; // For an illustration of the example word
  description: string; // Linguistic description
}

// Podcast Types
export interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  duration: string;
  date: string;
  topic: string; // e.g., History, Literature, Folklore
  audioUrl?: string; // Placeholder for real audio
}

// Blog Types
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string; // Simple HTML/Text
  author: string;
  date: string;
  readTime: string;
  tags: string[];
  imageUrl?: string;
}

// Forum Types
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

// Community & Contribution Types
export type ContributionType = 'report_error' | 'suggest_edit' | 'add_word';

export interface PendingContribution {
  id: string;
  type: ContributionType;
  user: string;
  word?: string;
  details: string; // The proposed change or report reason
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Badge {
  id: string;
  name: string;
  nameGeg: string;
  iconName: string; // We'll map this to actual Icon components
  description: string;
  descriptionGeg: string;
  color: string;
  earned: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string; // Added for auth
  role: string;
  tier?: string; // For support tiers
  level: number;
  levelTitle: string;
  levelTitleGeg: string;
  points: number;
  nextLevelPoints: number;
  badges: Badge[];
  contributions: number;
  joinedDate: string;
}

// Shop Types
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

// Financial Types
export interface FinancialRecord {
  month: string;
  revenue: number; // Shop + Donations
  expenses: number; // Server costs, AI API costs
  profit: number;
  transactions: number;
}

// Interjection Types
export interface InterjectionEntry {
  word: string;
  origin: 'Turkish' | 'Slavic' | 'Latin/Italian';
  meaning: string;
  usage: string;
  example: string;
  tags: string[];
}
