import { EventEmitter } from 'node:events';

type Subscriber = (data: Record<string, unknown>) => void;

class SSEManager {
  private emitter = new EventEmitter();
  private maxListeners = 100;

  constructor() {
    this.emitter.setMaxListeners(this.maxListeners);
  }

  subscribe(inboxId: number, callback: Subscriber): void {
    this.emitter.on(String(inboxId), callback);
  }

  unsubscribe(inboxId: number, callback?: Subscriber): void {
    if (callback) {
      this.emitter.off(String(inboxId), callback);
    } else {
      this.emitter.removeAllListeners(String(inboxId));
    }
  }

  broadcast(inboxId: number, data: Record<string, unknown>): void {
    this.emitter.emit(String(inboxId), data);
  }
}

export const sseManager = new SSEManager();
