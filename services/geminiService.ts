import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DictionaryEntry } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const dictionarySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING, description: "The word being defined in Geg dialect" },
    phonetic: { type: Type.STRING, description: "IPA pronunciation or phonetic spelling" },
    partOfSpeech: { type: Type.STRING, description: "Noun, Verb, Adjective, etc." },
    definitionEnglish: { type: Type.STRING, description: "Definition in English" },
    definitionStandard: { type: Type.STRING, description: "Definition or equivalent in Standard Albanian (Tosk-based)" },
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
    examples: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          original: { type: Type.STRING, description: "Sentence in Geg dialect" },
          standard: { type: Type.STRING, description: "Equivalent sentence in Standard Albanian" },
          translation: { type: Type.STRING, description: "English translation" }
        },
        required: ["original", "standard", "translation"]
      }
    },
    culturalNote: { type: Type.STRING, description: "Interesting cultural context or usage note" },
    dialectRegion: { type: Type.STRING, description: "Specific sub-region if applicable (e.g., Shkodër, Kosovë)" }
  },
  required: ["word", "partOfSpeech", "definitionEnglish", "definitionStandard", "synonyms", "examples"]
};

export const fetchWordDefinition = async (query: string): Promise<DictionaryEntry> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Provide a detailed dictionary entry for the Albanian Geg dialect word or phrase related to: "${query}". 
      If the user queries in English or Standard Albanian, find the closest Geg equivalent and define that.
      Ensure the output is strictly valid JSON according to the schema.
      Focus on linguistic accuracy and cultural depth.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: dictionarySchema,
        temperature: 0.3, // Low temperature for factual accuracy
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
  // We use a random seed conceptual approach by asking for a random unique word
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Choose a unique, interesting, and culturally significant word from the Albanian Geg dialect. 
      Ideally something poetic, archaic, or commonly used in daily life but distinct from Standard Albanian.
      Provide the full dictionary entry for it.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: dictionarySchema,
        temperature: 0.9, // Higher temperature for variety
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