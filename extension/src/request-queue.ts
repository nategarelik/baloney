// extension/src/request-queue.ts — Concurrent API request limiter

import { MAX_CONCURRENT } from "./config";

class RequestQueue {
  private max: number;
  private active = 0;
  private queue: Array<() => void> = [];

  constructor(maxConcurrent: number) {
    this.max = maxConcurrent;
  }

  async add<T>(fn: () => Promise<T>): Promise<T> {
    if (this.active >= this.max) {
      await new Promise<void>((resolve) => this.queue.push(resolve));
    }
    this.active++;
    try {
      return await fn();
    } finally {
      this.active--;
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        next?.();
      }
    }
  }
}

export const requestQueue = new RequestQueue(MAX_CONCURRENT);
