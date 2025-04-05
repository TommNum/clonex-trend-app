import Redis from 'ioredis';
import { Cache } from './cache';

export class RedisCache<T> extends Cache<T> {
    private redis: Redis;
    private prefix: string;

    constructor(ttl: number = 15 * 60 * 1000) {
        super(ttl);
        this.redis = new Redis(process.env.REDIS_URL + '?family=0' || 'redis://localhost:6379');
        this.prefix = 'timeline:';
    }

    async set(key: string, data: T): Promise<void> {
        const serializedData = JSON.stringify(data);
        await this.redis.setex(
            `${this.prefix}${key}`,
            Math.floor(this.ttl / 1000), // Convert to seconds
            serializedData
        );
    }

    async get(key: string): Promise<T | null> {
        const serializedData = await this.redis.get(`${this.prefix}${key}`);
        if (!serializedData) return null;
        return JSON.parse(serializedData);
    }

    async clear(): Promise<void> {
        const keys = await this.redis.keys(`${this.prefix}*`);
        if (keys.length > 0) {
            await this.redis.del(...keys);
        }
    }

    async clearForUser(userId: string): Promise<void> {
        const key = `${this.prefix}timeline:${userId}`;
        await this.redis.del(key);
    }
} 