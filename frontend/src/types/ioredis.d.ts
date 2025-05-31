declare module 'ioredis' {
  export default class Redis {
    constructor(url: string, options?: {
      maxRetriesPerRequest?: number;
      retryStrategy?: (times: number) => number | null;
    });
    
    disconnect(): void;
    
    // Add other Redis methods as needed
    get(key: string): Promise<string | null>;
    set(key: string, value: string, mode?: string, duration?: number): Promise<'OK'>;
    del(key: string | string[]): Promise<number>;
    expire(key: string, seconds: number): Promise<number>;
  }
}
