'use client';

import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'sasquach_clinical_vault';
const STORE_NAME = 'action_queue';
const DB_VERSION = 1;

export interface QueuedAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  attempts: number;
}

class ActionQueue {
  private db: Promise<IDBPDatabase> | null = null;
  private isProcessing = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.db = openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          }
        },
      });
      
      // Listen for online event
      window.addEventListener('online', () => this.processQueue());
    }
  }

  async enqueue(type: string, payload: any): Promise<void> {
    if (!this.db) return;

    const action: QueuedAction = {
      id: crypto.randomUUID(),
      type,
      payload,
      timestamp: Date.now(),
      attempts: 0,
    };

    const db = await this.db;
    await db.add(STORE_NAME, action);
    console.log(`[OFFLINE] Action queued: ${type}`, action.id);
    
    if (navigator.onLine) {
      this.processQueue();
    }
  }

  async processQueue(): Promise<void> {
    if (this.isProcessing || !this.db || !navigator.onLine) return;
    this.isProcessing = true;

    try {
      const db = await this.db;
      const actions: QueuedAction[] = await db.getAll(STORE_NAME);
      
      if (actions.length === 0) {
        this.isProcessing = false;
        return;
      }

      console.log(`[SYNC] Processing offline queue (${actions.length} actions)`);

      for (const action of actions.sort((a, b) => a.timestamp - b.timestamp)) {
        try {
          // Note: This logic will be triggered by useSasquachSync's publishToSync
          // However, ActionQueue itself needs a reference to the publish function or an event emitter
          const success = await this.triggerSync(action);
          if (success) {
            await db.delete(STORE_NAME, action.id);
            console.log(`[SYNC] Action synced and removed: ${action.id}`);
          } else {
            action.attempts++;
            await db.put(STORE_NAME, action);
            if (action.attempts > 10) {
               console.error(`[SYNC] Action ${action.id} failed too many times. Manual review required.`);
               // Keep it in DB or move to dead letter store
            }
          }
        } catch (e) {
          console.error(`[SYNC] Error processing action ${action.id}:`, e);
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  // Placeholder for the ACTUAL sync trigger. 
  // In a real app, we might use a callback registered by the hook.
  private syncHandler: ((type: string, payload: any) => Promise<boolean>) | null = null;

  setSyncHandler(handler: (type: string, payload: any) => Promise<boolean>) {
    this.syncHandler = handler;
    if (navigator.onLine) this.processQueue();
  }

  private async triggerSync(action: QueuedAction): Promise<boolean> {
    if (!this.syncHandler) return false;
    return await this.syncHandler(action.type, action.payload);
  }
}

export const actionQueue = typeof window !== 'undefined' ? new ActionQueue() : (null as any);
