
import { GoogleGenAI, Type } from "@google/genai";
import { DictionaryEntry, QuizQuestion, CrosswordData, AlphabetData, GlossaryTerm } from "../types";
import { db, Stores } from "./db";

async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const isRetryable = i < maxRetries - 1;
      const errorStr = JSON.stringify(err);
      const isRateLimit = err.message?.includes('429') || err.status === 429 || errorStr.includes('429');
      
      console.warn(`API attempt ${i + 1} failed:`, err.message || err);

      if (isRetryable) {
        // Use exponential backoff, longer for rate limits
        const baseDelay = isRateLimit ? 5000 : 1500;
        const delay = Math.pow(2, i) * baseDelay + Math.random() * 500;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

const getAI = () => {
  if (!process.env.API_KEY) {
    throw new Error("MISSING_API_KEY");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const saveToDictionaryCache = async (query: string, data: DictionaryEntry) => {
  try {
    await db.put(Stores.Dictionary, data);
  } catch (e) {
    console.warn("Sync/Cache failed", e);
  }
};

const dictionarySchema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING, description: "The word in Geg Language. If it is a verb, it MUST be in the infinitive form starting with 'me' and using the 'ue' diphthong (e.g., 'me punue')." },
    phonetic: { type: Type.STRING, description: "IPA phonetic spelling. MUST use the long vowel symbol ':' for the first letter of 'ue' and 'ie' (e.g., /u:/, /i:/)." },
    pronunciationNote: { type: Type.STRING, description: "Explain that only the first letter is pronounced but slightly elongated." },
    partOfSpeech: { type: Type.STRING },
    definitionEnglish: { type: Type.STRING },
    definitionStandard: { type: Type.STRING, description: "The equivalent in Standard Albanian (1972). Usually converts 'ue' back to 'ua'." },
    etymology: { type: Type.STRING },
    frequency: { type: Type.INTEGER, description: "Prevalence from 0 to 100." },
    usageNote: { type: Type.STRING },
    synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
    antonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
    examples: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          original: { type: Type.STRING, description: "Sentence in Geg using 'ue' and 'ie' where appropriate." },
          standard: { type: Type.STRING },
          translation: { type: Type.STRING }
        },
        required: ["original", "standard", "translation"]
      }
    }
  },
  required: ["word", "partOfSpeech", "definitionEnglish", "definitionStandard", "synonyms", "antonyms", "examples", "frequency", "usageNote"]
};

export const fetchWordDefinition = async (query: string): Promise<DictionaryEntry> => {
  const cached = await db.get<DictionaryEntry>(Stores.Dictionary, query.toLowerCase());
  if (cached) return cached;

  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a detailed dictionary entry for the word in the Geg Language: "${query}".`,
      config: {
        systemInstruction: `You are a linguistic expert on the Geg Language. 
        CRITICAL RULES:
        1. DIPHTHONGS: Always use 'ue' where standard has 'ua' (e.g., me punue, me kndue).
        2. ELONGATION RULE: For 'ue' and 'ie', only the first vowel is sounded, but it is ELONGATED. You MUST reflect this in the phonetic IPA using /u:/ and /i:/ and in pronunciation notes.
        3. VERBS: Must be infinitive with 'me'.
        4. No rhotacism: Keep 'n' where standard has 'r' (e.g., me kênë, vena).`,
        responseMimeType: "application/json",
        responseSchema: dictionarySchema,
        temperature: 0.1,
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from model");
    const data = JSON.parse(text) as DictionaryEntry;
    
    await saveToDictionaryCache(query, data);
    return data;
  });
};

export const fetchWordOfTheDay = async (): Promise<DictionaryEntry> => {
  const today = new Date().toISOString().split('T')[0];
  const cached = await db.get<any>(Stores.DailyData, 'wotd');
  
  if (cached && (cached as any).date === today) return (cached as any).data;

  try {
    return await callWithRetry(async () => {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a unique word of the day from the Geg Language. Select a culturally significant word with 'ue' or 'ie'.`,
        config: {
          systemInstruction: "Select culturally significant words from the Geg Language. Favor those that highlight the difference from Standard Albanian.",
          responseMimeType: "application/json",
          responseSchema: dictionarySchema,
          temperature: 0.8,
          thinkingConfig: { thinkingBudget: 0 }
        },
      });

      const text = response.text;
      if (!text) throw new Error("Empty response from model");
      const data = JSON.parse(text) as DictionaryEntry;
      await db.put(Stores.DailyData, { id: 'wotd', date: today, data });
      return data;
    });
  } catch (error) {
    // Robust fallback for word of the day
    return {
        word: "me kênë",
        phonetic: "mɛ kɛːnə",
        partOfSpeech: "Verb",
        definitionEnglish: "To be.",
        definitionStandard: "me qenë",
        etymology: "From Proto-Albanian roots, preserved in the Northern Geg variety.",
        frequency: 100,
        usageNote: "The fundamental verb of existence in Geg.",
        synonyms: ["me ekzistue"],
        antonyms: ["me mos-kênë"],
        examples: [{original: "Asht vështirë me kênë njeri.", standard: "Është vështirë të jesh njeri.", translation: "It is hard to be human."}]
    };
  }
};

export const fetchDailyQuiz = async (): Promise<QuizQuestion[]> => {
  const today = new Date().toISOString().split('T')[0];
  const cached = await db.get<any>(Stores.DailyData, 'quiz_set');
  
  if (cached && (cached as any).date === today) return (cached as any).data;

  try {
    return await callWithRetry(async () => {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Create a set of 5 quiz questions about the Geg Language. Include a question about the elongated pronunciation of 'ue' as /u:/.`,
        config: {
          systemInstruction: "You are an educator specialized in the Geg Language. Focus on diphthongs 'ue' and 'ie' and their unique elongation.",
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 },
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.INTEGER },
                explanation: { type: Type.STRING }
              },
              required: ["question", "options", "correctAnswer", "explanation"]
            }
          }
        },
      });
      
      const text = response.text;
      if (!text) throw new Error("Empty response");
      const data = JSON.parse(text) as QuizQuestion[];
      await db.put(Stores.DailyData, { id: 'quiz_set', date: today, data });
      return data;
    });
  } catch (error) {
    return [{
        question: "How is 'me punue' pronounced in authentic Geg?",
        options: ["Like 'ua'", "With a long 'u:' sound, silent 'e'", "As written", "As 'punoj'"],
        correctAnswer: 1,
        explanation: "In Geg, diphthongs like 'ue' and 'ie' only sound the first letter, but it is slightly elongated."
    }];
  }
};

export const fetchGlossaryTerms = async (letter: string): Promise<GlossaryTerm[]> => {
  const cached = await db.get<any>(Stores.Glossary, letter);
  if (cached) return (cached as any).terms;

  return callWithRetry(async () => {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide 10 diverse words from the Geg Language starting with the letter ${letter}. Use 'ue' for verbs.`,
        config: {
          systemInstruction: "Linguistic expert on the Geg Language. Return strictly JSON. Enforce 'ue' diphthong.",
          responseMimeType: "application/json",
          temperature: 0.2,
          thinkingConfig: { thinkingBudget: 0 },
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              terms: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT, 
                  properties: { 
                    word: { type: Type.STRING }, 
                    definition: { type: Type.STRING }, 
                    partOfSpeech: { type: Type.STRING }, 
                    origin: { type: Type.STRING } 
                  },
                  required: ["word", "definition", "partOfSpeech"]
                } 
              }
            },
            required: ["terms"]
          }
        },
      });
      const text = response.text;
      if (!text) throw new Error("Empty response");
      const terms = JSON.parse(text).terms;
      await db.put(Stores.Glossary, { id: letter, terms });
      return terms;
  });
};

export const fetchAlphabetWord = async (letter: string): Promise<AlphabetData> => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a word in the Geg Language starting with the letter ${letter}. Favor words with 'ue' or 'ie'.`,
      config: {
        systemInstruction: "You are an educator for children. Use authentic Geg spelling ('ue', 'ie').",
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            letter: { type: Type.STRING },
            word: { type: Type.STRING },
            translation: { type: Type.STRING },
            pronunciation: { type: Type.STRING },
            exampleSentence: { type: Type.STRING },
            imagePrompt: { type: Type.STRING, description: "A short English prompt to generate a cute illustration of this word." }
          },
          required: ["letter", "word", "translation", "pronunciation", "exampleSentence", "imagePrompt"]
        }
      },
    });
    const text = response.text;
    if (!text) throw new Error("Empty response");
    return JSON.parse(text) as AlphabetData;
  });
};

export const fetchCrosswordPuzzle = async (): Promise<CrosswordData> => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Generate a crossword puzzle with words in the Geg Language. Use 'ue' in the words.",
      config: {
        systemInstruction: "Expert puzzle creator. Enforce Geg 'ue' and 'ie' diphthongs.",
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            width: { type: Type.INTEGER },
            height: { type: Type.INTEGER },
            words: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  clue: { type: Type.STRING },
                  startX: { type: Type.INTEGER },
                  startY: { type: Type.INTEGER },
                  direction: { type: Type.STRING, enum: ["across", "down"] }
                },
                required: ["word", "clue", "startX", "startY", "direction"]
              }
            }
          },
          required: ["title", "width", "height", "words"]
        }
      },
    });
    const text = response.text;
    if (!text) throw new Error("Empty response");
    return JSON.parse(text) as CrosswordData;
  });
};

export const fetchKidIllustration = async (prompt: string): Promise<string> => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A simple, cute, colorful child-friendly illustration of: ${prompt}. No text, white background, high quality vector style.` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });
    
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image generated");
  });
};

export const fetchEtymologyImage = async (prompt: string): Promise<string> => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A historical or conceptual illustration showing the linguistic roots/origin of: ${prompt}. Artistic watercolor style, evocative, no text.` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });
    
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image generated");
  });
};

export const fetchProductVisual = async (prompt: string): Promise<string> => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A professional product photograph of ${prompt}. High quality, clean white studio background, commercial lighting, elegant presentation, 8k resolution.` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });
    
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image generated");
  });
};
