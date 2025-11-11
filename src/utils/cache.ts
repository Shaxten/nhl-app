export function getCachedData<T>(key: string): T | null {
  const cached = localStorage.getItem(key);
  if (!cached) return null;
  
  const { data, timestamp } = JSON.parse(cached);
  const now = new Date().setHours(0, 0, 0, 0);
  const cacheDate = new Date(timestamp).setHours(0, 0, 0, 0);
  
  if (now > cacheDate) {
    localStorage.removeItem(key);
    return null;
  }
  
  return data;
}

export function setCachedData<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
}

export function clearCache(key: string): void {
  localStorage.removeItem(key);
}
