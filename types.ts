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
  antonyms: string[];
  examples: ExampleSentence[];
  culturalNote?: string;
  dialectRegion?: string; // e.g., "Northwestern Geg", "Central Geg"
}

export interface SearchState {
  isLoading: boolean;
  error: string | null;
  data: DictionaryEntry | null;
}