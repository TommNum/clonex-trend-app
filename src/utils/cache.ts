interface CacheItem<T> {
    data: T;
    timestamp: number;
}

export abstract class Cache<T> {
    protected ttl: number; // Time to live in milliseconds

    constructor(ttl: number = 15 * 60 * 1000) { // Default 15 minutes
        this.ttl = ttl;
    }

    abstract set(key: string, data: T): Promise<void>;
    abstract get(key: string): Promise<T | null>;
    abstract clear(): Promise<void>;
} 