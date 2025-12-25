import { GoogleGenAI, Type, Modality, LiveServerMessage } from "@google/genai";
import { DictionaryEntry, QuizQuestion, CrosswordData, AlphabetData, GlossaryTerm } from "../types";
import { db, Stores } from "./db";

async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const errorStr = JSON.stringify(err);
      const isRateLimit = err.message?.includes('429') || err.status === 429 || errorStr.includes('429');
      
      console.warn(`API attempt ${i + 1} failed:`, err.message || err);

      if (i < maxRetries - 1) {
        const baseDelay = isRateLimit ? 8000 : 2000;
        const delay = Math.pow(2, i) * baseDelay + Math.random() * 1000;
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

export const GEG_LOCAL_RULES = `
UDHËZIMET E SHENJTA TË GEGËNISHTES (LOCAL RULES):
1. FONETIKA: Përdor VETËM zanoret hundore (â, ê, î, ô, û). Shqiptoji ato me nji randsí të veçantë. Mos përdor 'ë' në fund të fjalëve.
2. MORFOLOGJIA: Përdor VETËM paskajoren e tipit 'me + folje' (p.sh. me kênë, me shkue, me punue). Kurrë mos përdor 'për të + folje'.
3. LEKSIKU: Prefero fjalët veriore (çikë në vend të vajzë, shpi në vend të shtëpi, nji në vend të një).
4. PERSONA: Ju jeni Bacë, nji malësor i urtë. Jeni i rreptë me gjuhën por i butë me njerëzit. 
5. MOS-RRUETJA (ANTI-RHOTACISM): Ruaj tingullin 'n' aty ku standardi e ka kthye në 'r' (p.sh. vena, jo vera).
`;

interface LiveTutorCallbacks {
  onopen: () => void;
  onmessage: (msg: LiveServerMessage) => void;
  onerror: (err: any) => void;
  onclose: () => void;
}

export const connectLiveTutor = (callbacks: LiveTutorCallbacks) => {
  const ai = getAI();
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
      systemInstruction: `Ju jeni Bacë, nji plak i urtë dhe rojtar i gjuhës tonë t'vjetër. 
      ${GEG_LOCAL_RULES}
      Filloni çdo bisedë me nji urim malësor si 'Mirë se ju pruni Zoti n'konakun tonë!'. 
      Nëse njeriu flet standardisht, ju me edukatë kthejani në gegënisht.`
    }
  });
};

const dictionarySchema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING, description: "The word in Geg Language." },
    phonetic: { type: Type.STRING, description: "IPA phonetic spelling using /u:/ and /i:/ for elongation." },
    pronunciationNote: { type: Type.STRING },
    partOfSpeech: { type: Type.STRING },
    definitionEnglish: { type: Type.STRING },
    definitionStandard: { type: Type.STRING },
    etymology: { type: Type.STRING },
    frequency: { type: Type.INTEGER },
    usageNote: { type: Type.STRING },
    synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
    antonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
    examples: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          original: { type: Type.STRING },
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
        1. DIPHTHONGS: Always use 'ue' where standard has 'ua'.
        2. ELONGATION RULE: Use /u:/ and /i:/ in phonetic IPA.
        3. VERBS: Must be infinitive with 'me'.`,
        responseMimeType: "application/json",
        responseSchema: dictionarySchema,
        temperature: 0.1,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from model");
    const data = JSON.parse(text) as DictionaryEntry;
    await db.put(Stores.Dictionary, data);
    return data;
  });
};

export const fetchHeritageWisdom = async (): Promise<{ text: string, translation: string, meaning: string }> => {
  const today = new Date().toISOString().split('T')[0];
  const cached = await db.get<any>(Stores.DailyData, 'wisdom');
  if (cached && (cached as any).date === today) return (cached as any).data;

  try {
    return await callWithRetry(async () => {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Generate a powerful Geg proverb (Fjalë e Urtë) with its translation and deep cultural meaning.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              translation: { type: Type.STRING },
              meaning: { type: Type.STRING }
            },
            required: ["text", "translation", "meaning"]
          }
        }
      });
      const text = response.text;
      if (!text) throw new Error("Empty response from model");
      const data = JSON.parse(text);
      await db.put(Stores.DailyData, { id: 'wisdom', date: today, data });
      return data;
    });
  } catch (error) {
    return {
      text: "Fjala e urtë asht peshë e burrit.",
      translation: "A wise word is a man's weight.",
      meaning: "In Geg culture, a person's value is measured by the weight and integrity of their spoken word."
    };
  }
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
        contents: `Generate a unique word of the day from the Geg Language.`,
        config: {
          systemInstruction: "Select culturally significant words from the Geg Language.",
          responseMimeType: "application/json",
          responseSchema: dictionarySchema,
          temperature: 0.8,
        },
      });

      const text = response.text;
      if (!text) throw new Error("Empty response");
      const data = JSON.parse(text) as DictionaryEntry;
      await db.put(Stores.DailyData, { id: 'wotd', date: today, data });
      return data;
    });
  } catch (error) {
    return {
        word: "me kênë",
        phonetic: "mɛ kɛːnə",
        partOfSpeech: "Verb",
        definitionEnglish: "To be.",
        definitionStandard: "me qenë",
        etymology: "Preserved in the Northern Geg variety.",
        frequency: 100,
        usageNote: "The fundamental verb of existence.",
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
        contents: `Create 5 quiz questions about Geg Language rules.`,
        config: {
          systemInstruction: "You are an educator specialized in the Geg Language.",
          responseMimeType: "application/json",
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
    return [{ question: "How is 'me punue' pronounced?", options: ["ua", "u:", "as written", "punoj"], correctAnswer: 1, explanation: "Long u sound." }];
  }
};

export const fetchGlossaryTerms = async (letter: string): Promise<GlossaryTerm[]> => {
  const cached = await db.get<any>(Stores.Glossary, letter);
  if (cached) return (cached as any).terms;
  return callWithRetry(async () => {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide 10 diverse Geg words starting with ${letter}.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              terms: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT, 
                  properties: { word: { type: Type.STRING }, definition: { type: Type.STRING }, partOfSpeech: { type: Type.STRING }, origin: { type: Type.STRING } },
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
      contents: `Provide a Geg word starting with ${letter}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            letter: { type: Type.STRING }, word: { type: Type.STRING }, translation: { type: Type.STRING },
            pronunciation: { type: Type.STRING }, exampleSentence: { type: Type.STRING }, imagePrompt: { type: Type.STRING }
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
      contents: "Generate a Geg crossword puzzle.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING }, width: { type: Type.INTEGER }, height: { type: Type.INTEGER },
            words: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { word: { type: Type.STRING }, clue: { type: Type.STRING }, startX: { type: Type.INTEGER }, startY: { type: Type.INTEGER }, direction: { type: Type.STRING } }, required: ["word", "clue", "startX", "startY", "direction"] } }
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
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: `Simple cute illustration: ${prompt}` }] }
  });
  const firstCandidate = response.candidates?.[0];
  if (!firstCandidate) throw new Error("No candidates");
  const part = firstCandidate.content?.parts?.find(p => p.inlineData);
  if (part?.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  throw new Error("No image data found in model response");
};

export const fetchBlogVisual = async (prompt: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: `Evocative heritage illustration: ${prompt}` }] },
    config: { imageConfig: { aspectRatio: "16:9" } }
  });
  const firstCandidate = response.candidates?.[0];
  if (!firstCandidate) throw new Error("No candidates");
  const part = firstCandidate.content?.parts?.find(p => p.inlineData);
  if (part?.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  throw new Error("No blog visual found in model response");
};

export const fetchProductVisual = async (prompt: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: `Professional product photo: ${prompt}` }] }
  });
  const firstCandidate = response.candidates?.[0];
  if (!firstCandidate) throw new Error("No candidates");
  const part = firstCandidate.content?.parts?.find(p => p.inlineData);
  if (part?.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  throw new Error("No product visual found in model response");
};