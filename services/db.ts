import { supabase, isRemoteActive } from './supabaseClient';

const DB_NAME = 'GegenishtSecureDB';
const DB_VERSION = 8; 

export enum Stores {
  Dictionary = 'dictionary',
  Blog = 'blog',
  Glossary = 'glossary',
  DailyData = 'daily_data',
  Scores = 'scores',
  Products = 'products',
  AuditLogs = 'audit_logs',
  Alphabet = 'alphabet',
  Transactions = 'transactions'
}

const STORE_COLUMNS: Record<string, string[]> = {
  [Stores.Dictionary]: [
    'word', 'phonetic', 'pronunciation_note', 'part_of_speech', 
    'definition_english', 'definition_standard', 'etymology', 
    'frequency', 'usage_note', 'synonyms', 'antonyms', 'examples', 
    'status', 'source', 'author_id', 'last_synced_at'
  ],
  [Stores.DailyData]: ['id', 'date', 'data'],
  [Stores.Blog]: ['id', 'title', 'excerpt', 'content', 'author', 'date', 'read_time', 'tags', 'image_url'],
  [Stores.Scores]: ['id', 'name', 'score', 'date', 'mode'],
  [Stores.Transactions]: ['id', 'user_id', 'user_name', 'amount', 'tier', 'method', 'timestamp']
};

const toSnake = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(toSnake);
    const snake: any = {};
    for (const key in obj) {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        snake[snakeKey] = toSnake(obj[key]);
    }
    return snake;
};

const toCamel = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(toCamel);
    const camel: any = {};
    for (const key in obj) {
        const camelKey = key.replace(/([-_][a-z])/g, group => group.toUpperCase().replace('-', '').replace('_', ''));
        camel[camelKey] = toCamel(obj[key]);
    }
    return camel;
};

export class AppDatabase {
  private db: IDBDatabase | null = null;
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          Object.values(Stores).forEach(store => {
            if (!db.objectStoreNames.contains(store)) {
              const keyPath = store === Stores.Dictionary ? 'word' : 'id';
              db.createObjectStore(store, { keyPath });
            }
          });
        };

        request.onsuccess = () => {
          this.db = request.result;
          this.isInitialized = true;
          resolve();
        };

        request.onerror = () => {
            reject(new Error("IndexedDB initialization failed"));
        };
      } catch (err: any) {
        reject(err);
      }
    });
  }

  async get<T>(storeName: Stores, key: string): Promise<T | null> {
    await this.init();
    
    const localResult = await new Promise<T | null>((resolve) => {
      try {
        const transaction = this.db!.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key.toLowerCase());
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => resolve(null);
      } catch (err: any) {
        resolve(null);
      }
    });

    if (localResult) return localResult;

    if (isRemoteActive() && STORE_COLUMNS[storeName]) {
        try {
            const idCol = storeName === Stores.Dictionary ? 'word' : 'id';
            const { data, error } = await supabase!
                .from(storeName)
                .select('*')
                .eq(idCol, key.toLowerCase())
                .maybeSingle();
            
            if (error) throw error;

            if (data) {
                const camelData = toCamel(data);
                await this.putLocal(storeName, camelData);
                return camelData as T;
            }
        } catch (e: any) {
            console.warn(`[DB] Remote lookup bypassed:`, e.message || e);
        }
    }

    return null;
  }

  async put<T>(storeName: Stores, data: any): Promise<void> {
    await this.init();
    
    const normalizedData = { ...data };
    if (storeName === Stores.Dictionary && normalizedData.word) {
        normalizedData.word = normalizedData.word.toLowerCase();
    }

    await this.putLocal(storeName, normalizedData);

    if (isRemoteActive() && STORE_COLUMNS[storeName]) {
        try {
            let snakeData = toSnake(normalizedData);
            const allowed = STORE_COLUMNS[storeName];
            const filtered: any = {};
            allowed.forEach(col => {
                if (snakeData[col] !== undefined) {
                    filtered[col] = snakeData[col];
                }
            });
            
            await supabase!.from(storeName).upsert(filtered);
        } catch (e: any) {
            console.warn(`[DB] Remote sync skipped:`, e.message || e);
        }
    }
  }

  private async putLocal<T>(storeName: Stores, data: T): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(data);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } catch (err: any) {
        reject(err);
      }
    });
  }

  async getAll<T>(storeName: Stores): Promise<T[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      } catch (err: any) {
        reject(err);
      }
    });
  }

  async delete(storeName: Stores, key: string): Promise<void> {
    await this.init();
    
    // Execute local delete
    await new Promise<void>((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key.toLowerCase());
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } catch (err: any) {
        reject(err);
      }
    });

    // Remote delete (fire and forget / non-blocking)
    if (isRemoteActive()) {
        const idCol = storeName === Stores.Dictionary ? 'word' : 'id';
        // Use an async IIFE to handle the potential error properly and avoid chaining issues.
        (async () => {
          try {
            await supabase!.from(storeName).delete().eq(idCol, key.toLowerCase());
          } catch (e: any) {
            console.warn("[DB] Remote Delete Bypassed", e.message || e);
          }
        })();
    }
  }

  async clearStore(storeName: Stores): Promise<void> {
      await this.init();
      return new Promise((resolve, reject) => {
          try {
            const transaction = this.db!.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          } catch (err: any) {
            reject(err);
          }
      });
  }

  async verifyIntegrity(): Promise<boolean> {
      try {
          await this.init();
          return !!this.db;
      } catch (e: any) {
          return false;
      }
  }
}

export const db = new AppDatabase();