import { ITransport } from './transport';
import { RitualEvent } from '../types';

export class BroadcastTransport implements ITransport {
  private channel: BroadcastChannel;

  constructor(channelName: string = 'sasquach-ritual') {
    this.channel = new BroadcastChannel(channelName);
  }

  publish(event: RitualEvent): void {
    this.channel.postMessage(event);
  }

  subscribe(callback: (event: RitualEvent) => void): () => void {
    const handler = (event: MessageEvent) => {
      callback(event.data);
    };
    this.channel.addEventListener('message', handler);
    return () => {
      this.channel.removeEventListener('message', handler);
    };
  }

  close(): void {
    this.channel.close();
  }
}
