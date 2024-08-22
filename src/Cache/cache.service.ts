import { Injectable } from '@nestjs/common';
import { createClient } from 'redis';
import { promisify } from 'util';

@Injectable()
export class CacheService {
  private client;
  private getAsync;
  private setAsync;
  private delAsync;

  constructor() {
    this.client = createClient({
      password: process.env.REDIS_PASSWORD,
      socket: {
        host: process.env.REDIS_HOST,
        port: 18607,
        family: 4,
      },
    });

    // Conectar al cliente Redis
    this.client.connect().catch((err) => {
      console.error('Error connecting to Redis:', err);
    });

    // Convertir métodos de Redis a promesas para usar async/await
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  // Obtener un valor del cache
  async get(key: string): Promise<any> {
    try {
      const value = await this.getAsync(key);
      return value ? JSON.parse(value) : null;
    } catch (err) {
      console.error('Error getting value from Redis:', err);
      return null;
    }
  }

  // Guardar un valor en el cache
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);
      if (ttl) {
        await this.setAsync(key, stringValue, 'EX', ttl);
      } else {
        await this.setAsync(key, stringValue);
      }
    } catch (err) {
      console.error('Error setting value in Redis:', err);
    }
  }

  // Eliminar un valor del cache
  async del(key: string): Promise<void> {
    try {
      await this.delAsync(key);
    } catch (err) {
      console.error('Error deleting value from Redis:', err);
    }
  }

  // Limpiar todo el cache
  async reset(): Promise<void> {
    try {
      await this.client.flushDb();
    } catch (err) {
      console.error('Error flushing Redis cache:', err);
    }
  }
}
