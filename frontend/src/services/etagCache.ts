class ETagCache {
  private cache = new Map<string, string>();

  set(key: string, etag: string): void {
    this.cache.set(key, etag);
  }

  get(key: string): string | undefined {
    return this.cache.get(key);
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  generateKey(method: string, endpoint: string): string {
    return `${method.toUpperCase()}:${endpoint}`;
  }
}

export const etagCache = new ETagCache();