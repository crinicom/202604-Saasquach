import { RitualEvent } from '../types';

export interface ITransport {
  publish(event: RitualEvent): void | Promise<void>;
  subscribe(callback: (event: RitualEvent) => void): () => void;
  close(): void;
}
