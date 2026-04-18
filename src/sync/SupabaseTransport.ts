import { ITransport } from './transport';
import { RitualEvent } from '../types';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class SupabaseTransport implements ITransport {
  private supabase: SupabaseClient;
  private channel: any;
  private channelName: string;
  private callbacks: Set<(event: RitualEvent) => void> = new Set();
  private subscribed = false;

  constructor(supabaseUrl: string, supabaseKey: string, ritualId: string) {
    this.channelName = `ritual-${ritualId.toLowerCase()}`;
    
    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      this.setupChannel();
    } else {
      console.warn('[SUPABASE] No URL or key provided');
      throw new Error('Supabase URL and key required');
    }
  }

  private setupChannel() {
    console.log(`[SUPABASE] Setting up channel: ${this.channelName}`);
    
    this.channel = this.supabase.channel(this.channelName);
    
    this.channel.on('broadcast', { event: 'ritual-event' }, (payload: { payload: RitualEvent }) => {
      console.log(`[SUPABASE] Received: ${payload.payload?.type}`);
      this.callbacks.forEach(cb => cb(payload.payload));
    });

    this.channel.subscribe((status: string) => {
      console.log(`[SUPABASE] Subscribe status: ${status}`);
      this.subscribed = status === 'SUBSCRIBED';
    });
  }

  async publish(event: RitualEvent): Promise<void> {
    if (!this.channel || !this.subscribed) {
      console.warn('[SUPABASE] Not subscribed, queuing message');
      if (this.channel) {
        const status = await this.channel.send({
          type: 'broadcast',
          event: 'ritual-event',
          payload: event,
        });
        console.log(`[SUPABASE] Send result:`, status);
        return;
      }
      console.warn('[SUPABASE] No channel, message dropped');
      return;
    }

    console.log(`[SUPABASE] Publishing: ${event.type}`);
    
    await this.channel.send({
      type: 'broadcast',
      event: 'ritual-event',
      payload: event,
    });
  }

  subscribe(callback: (event: RitualEvent) => void): () => void {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  close(): void {
    if (this.channel) {
      this.supabase.removeChannel(this.channel);
    }
    this.callbacks.clear();
  }
}

export const createSupabaseTransport = (
  supabaseUrl: string,
  supabaseKey: string,
  ritualId: string
): ITransport => {
  return new SupabaseTransport(supabaseUrl, supabaseKey, ritualId);
};