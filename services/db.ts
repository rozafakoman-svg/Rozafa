
/**
 * Local Database Service for Offline Capability
 * Enhanced with Supabase Cloud Sync & Robust Data Mapping.
 */
import { supabase, isRemoteActive } from './supabaseClient';

const DB_NAME = 'GegenishtSecureDB';
const DB_VERSION = 7; 

export enum Stores {
  Dictionary = 'dictionary',
  Blog = 'blog',
  Glossary = 'glossary',
  DailyData = 'daily_data',
  Scores = 'scores',
  Products = 'products',
  AuditLogs = 'audit_logs',
  Alphabet = 'alphabet'
}

/**
 * Mapping helper to convert camelCase (App) to snake_case (DB)
 */
const toSnake = (obj: any) => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
    const snake: any = {};
    for (const key in obj) {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        snake[snakeKey] = obj[key];
    }
    return snake;
};

/**
 * Mapping helper to convert snake_case (DB) to camelCase (App)
 */
const toCamel = (obj: any) => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
    const camel: any = {};
    for (const key in obj) {
        const camelKey = key.replace(/([-_][a-z])/g, group => group.toUpperCase().replace('-', '').replace('_', ''));
        camel[camelKey] = obj[key];
    }
    return camel;
};

export class AppDatabase {
  private db: IDBDatabase | null = null;
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
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

      request.onsuccess = async () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log(`[DB] Local Engine Started (v${DB_VERSION})`);
        
        if (isRemoteActive()) {
            console.log("[DB] Cloud Link Established. Ready for synchronization.");
        }
        resolve();
      };

      request.onerror = () => {
          console.error("[DB] Initialization Failed:", request.error);
          reject(request.error);
      };
    });
  }

  async get<T>(storeName: Stores, key: string): Promise<T | null> {
    await this.init();
    
    // 1. Try Local Cache First (Lightning fast)
    const localResult = await new Promise<T | null>((resolve) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key.toLowerCase());
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });

    if (localResult) return localResult;

    // 2. Try Remote Supabase (Global sync)
    const syncableStores = [Stores.Dictionary, Stores.Blog, Stores.Glossary, Stores.DailyData, Stores.Scores, Stores.Alphabet, Stores.Products];
    if (isRemoteActive() && syncableStores.includes(storeName)) {
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
            console.warn(`[DB] Cloud lookup bypassed for ${storeName}/${key}:`, e.message || e);
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

    // 1. Save Local (Offline-first approach)
    await this.putLocal(storeName, normalizedData);

    // 2. Sync to Supabase in background
    const syncableStores = [Stores.Dictionary, Stores.Blog, Stores.Glossary, Stores.DailyData, Stores.Scores, Stores.Alphabet, Stores.Products];
    if (isRemoteActive() && syncableStores.includes(storeName)) {
        try {
            const snakeData = toSnake(normalizedData);
            const { error } = await supabase!.from(storeName).upsert(snakeData);
            if (error) {
                console.error(`[DB] Cloud Sync Failed for ${storeName}:`, error.message);
            } else {
                console.debug(`[DB] Cloud Sync Verified: ${storeName}`);
            }
        } catch (e: any) {
            console.warn(`[DB] Remote sync exception for ${storeName}`, e.message || e);
        }
    }
  }

  private async putLocal<T>(storeName: Stores, data: T): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: Stores): Promise<T[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: Stores, key: string): Promise<void> {
    await this.init();
    const pLocal = new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key.toLowerCase());
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    if (isRemoteActive()) {
        const idCol = storeName === Stores.Dictionary ? 'word' : 'id';
        supabase!.from(storeName).delete().eq(idCol, key.toLowerCase()).catch(e => console.error("[DB] Remote Delete Error", e));
    }
    return pLocal;
  }

  async clearStore(storeName: Stores): Promise<void> {
      await this.init();
      return new Promise((resolve, reject) => {
          const transaction = this.db!.transaction(storeName, 'readwrite');
          const store = transaction.objectStore(storeName);
          const request = store.clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
      });
  }

  async verifyIntegrity(): Promise<boolean> {
      // Basic check to ensure engine is responsive
      try {
          await this.init();
          return !!this.db;
      } catch (e) {
          return false;
      }
  }
}

export const db = new AppDatabase();
