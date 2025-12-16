
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DictionaryEntry, QuizQuestion, CrosswordData, AlphabetData, GlossaryTerm } from "../types";

// Helper to initialize AI safely
const getAI = () => {
  const apiKey = process.env.API_KEY;
  // Check for undefined, null, or empty string, or the string "undefined" which can happen during string replacement
  if (!apiKey || apiKey === 'undefined' || apiKey.trim() === '') {
    console.error("API Key is missing. Please check your environment variables.");
    throw new Error("MISSING_API_KEY");
  }
  return new GoogleGenAI({ apiKey });
};

const dictionarySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING, description: "The word being defined in Geg language" },
    phonetic: { type: Type.STRING, description: "IPA pronunciation or phonetic spelling" },
    pronunciationNote: { type: Type.STRING, description: "Brief explanation of specific sounds (e.g. nasal vowels) or IPA details" },
    partOfSpeech: { type: Type.STRING, description: "Noun, Verb, Adjective, etc." },
    definitionEnglish: { type: Type.STRING, description: "Definition in English" },
    definitionStandard: { type: Type.STRING, description: "Equivalent in Standard Albanian (Unified in 1972)" },
    etymology: { type: Type.STRING, description: "Origin of the word" },
    synonyms: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Synonyms in Geg or Standard Albanian" 
    },
    antonyms: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Antonyms in Geg or Standard Albanian" 
    },
    relatedWords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Words that are related but not direct synonyms"
    },
    relatedPhrases: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Common phrases, idioms, or collocations involving this word"
    },
    examples: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          original: { type: Type.STRING, description: "Sentence in Geg language" },
          standard: { type: Type.STRING, description: "Equivalent sentence in Standard Albanian" },
          translation: { type: Type.STRING, description: "English translation" }
        },
        required: ["original", "standard", "translation"]
      }
    },
    culturalNote: { type: Type.STRING, description: "Interesting cultural context or usage note" },
    dialectRegion: { type: Type.STRING, description: "Specific region where this word is most common (e.g., Shkodër, Kosovë)" },
    grammarNotes: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Brief notes on grammar, conjugation, or pluralization specific to this word"
    }
  },
  required: ["word", "partOfSpeech", "definitionEnglish", "definitionStandard", "synonyms", "examples"]
};

const quizSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    question: { type: Type.STRING, description: "A multiple choice question about Geg language vocabulary or grammar" },
    options: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING }, 
      description: "4 possible answers" 
    },
    correctAnswer: { type: Type.INTEGER, description: "The index (0-3) of the correct answer" },
    explanation: { type: Type.STRING, description: "Brief explanation of why the answer is correct" }
  },
  required: ["question", "options", "correctAnswer", "explanation"]
};

const crosswordSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    width: { type: Type.INTEGER, description: "Width of the grid, max 10" },
    height: { type: Type.INTEGER, description: "Height of the grid, max 10" },
    words: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING, description: "The word in the puzzle (uppercase)" },
          clue: { type: Type.STRING, description: "The clue for the word" },
          startX: { type: Type.INTEGER, description: "0-based x coordinate" },
          startY: { type: Type.INTEGER, description: "0-based y coordinate" },
          direction: { type: Type.STRING, enum: ["across", "down"] }
        },
        required: ["word", "clue", "startX", "startY", "direction"]
      }
    }
  },
  required: ["title", "width", "height", "words"]
};

const alphabetSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    letter: { type: Type.STRING },
    word: { type: Type.STRING, description: "A simple Geg language word starting with the letter, suitable for kids" },
    translation: { type: Type.STRING, description: "English translation" },
    pronunciation: { type: Type.STRING },
    exampleSentence: { type: Type.STRING, description: "Very simple sentence using the word" },
    imagePrompt: { type: Type.STRING, description: "Prompt for an illustration of the word, cute style" }
  },
  required: ["letter", "word", "translation", "pronunciation", "exampleSentence", "imagePrompt"]
};

const glossarySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    terms: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING, description: "The word in Geg" },
          definition: { type: Type.STRING, description: "Short definition in English" },
          partOfSpeech: { type: Type.STRING, description: "Part of speech" },
          origin: { type: Type.STRING, description: "Etymological origin (e.g. Native, Turkish, Slavic, Latin)" }
        },
        required: ["word", "definition", "partOfSpeech", "origin"]
      }
    }
  },
  required: ["terms"]
};

export const fetchWordDefinition = async (query: string): Promise<DictionaryEntry> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Provide a detailed dictionary entry for the Geg language word or phrase related to: "${query}". 
      Note: Treat "Standard Albanian" as the standardized form imposed in 1972, and "Geg" as the authentic language of Northern Albania/Kosovo.
      If the user queries in English or Standard Albanian, find the closest Geg equivalent and define that.
      Ensure the output is strictly valid JSON according to the schema.
      Focus on linguistic accuracy and cultural depth.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: dictionarySchema,
        temperature: 0.3,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No data returned from Gemini");

    return JSON.parse(text) as DictionaryEntry;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const fetchWordOfTheDay = async (): Promise<DictionaryEntry> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Choose a unique, interesting, and culturally significant word from the Geg language. 
      Ideally something poetic, archaic, or commonly used in daily life but distinct from the 1972 Standard Albanian.
      Provide the full dictionary entry for it.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: dictionarySchema,
        temperature: 0.9, 
      },
    });

    const text = response.text;
    if (!text) throw new Error("No data returned");
    return JSON.parse(text) as DictionaryEntry;
  } catch (error) {
    console.error("Word of the Day Error:", error);
    throw error;
  }
};

export const fetchDailyQuiz = async (): Promise<QuizQuestion> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Create a multiple-choice question to test knowledge of Geg language vocabulary or grammar, potentially contrasting it with the 1972 Standard.
      Make it challenging but educational.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
        temperature: 0.8,
      },
    });
    
    const text = response.text;
    if (!text) throw new Error("No quiz data");
    return JSON.parse(text) as QuizQuestion;
  } catch (error) {
    console.error("Quiz Error", error);
    throw error;
  }
};

export const fetchEtymologyImage = async (word: string, etymology: string): Promise<string | null> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            text: `Create a vintage, academic textbook illustration or ink drawing that visually represents the etymology, root origin, or literal meaning of the Geg language word "${word}". 
            Context/Etymology: ${etymology}. 
            Style: Classical dictionary illustration, black and white or sepia ink, detailed, historical, educational. No text in the image.`
          }
        ]
      }
    });

    if (response.candidates && response.candidates.length > 0) {
      const parts = response.candidates[0].content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
             return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
  }
};

export const fetchCrosswordPuzzle = async (): Promise<CrosswordData> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a mini crossword puzzle (max 10x10) with exactly 5-6 words related to Geg culture, geography, or language.
      
      STRICT REQUIREMENTS:
      1. Words MUST intersect correctly with common letters. This is critical.
      2. All words must be placed within a 10x10 grid (coordinates 0-9).
      3. Words must be in Albanian (Geg dialect preferred).
      4. Clues must be in English.
      
      Verify intersections before returning.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: crosswordSchema,
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 2048 }
      },
    });

    const text = response.text;
    if (!text) throw new Error("No crossword data");
    return JSON.parse(text) as CrosswordData;
  } catch (error) {
    console.error("Crossword Error:", error);
    throw error;
  }
};

export const fetchAlphabetWord = async (letter: string): Promise<AlphabetData> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Provide a simple, child-friendly word in the Geg language starting with the letter "${letter}".
      Also provide its English translation, a very simple example sentence, and an image prompt for a cute illustration.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: alphabetSchema,
        temperature: 0.5,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No alphabet data");
    return JSON.parse(text) as AlphabetData;
  } catch (error) {
    console.error("Alphabet Error:", error);
    throw error;
  }
};

export const fetchKidIllustration = async (prompt: string): Promise<string | null> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            text: `Create a cute, colorful, flat-vector style illustration for children.
            Subject: ${prompt}.
            Style: Bright colors, simple shapes, white background, like a children's book asset. No text.`
          }
        ]
      }
    });

    if (response.candidates && response.candidates.length > 0) {
      const parts = response.candidates[0].content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
             return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Kid Illustration Error:", error);
    return null;
  }
};

export const fetchGlossaryTerms = async (letter: string): Promise<GlossaryTerm[]> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a list of 12 distinct, authentic, and culturally significant words specifically in the Geg Albanian dialect (Northern Albania/Kosovo) that start with the letter "${letter}". 
      
      STRICT GUIDELINES:
      1. DO NOT provide Standard Albanian words found in the 1972 unified dictionary unless the Geg form is identical (unlikely for cultural terms).
      2. Use specific Geg features:
         - Nasal vowels: â (hâna vs hëna), ê (kênë vs qenë).
         - Infinitive forms for verbs: "me ba" instead of "bëj", "me shkue" instead of "shkoj".
         - Rhotacism absence: "n" instead of "r" where appropriate (e.g., "venë" vs "verë" for wine, though varies by sub-dialect).
      3. Focus on folklore, Kanun, daily life in the north, and archaic terms.
      
      For each word, provide:
      - A very short English definition (max 10 words)
      - Its part of speech
      - Its likely etymological origin (e.g., Native, Turkish, Slavic, Latin, Greek) if known/applicable.
      
      Return strictly JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: glossarySchema,
        temperature: 0.4,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No glossary data");
    const result = JSON.parse(text);
    return result.terms as GlossaryTerm[];
  } catch (error) {
    console.error("Glossary Fetch Error:", error);
    throw error;
  }
};
