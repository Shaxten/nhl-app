const PROXIES = [
  (url: string) => `https://corsproxy.io/?${url}`,
  (url: string) => `https://api.allorigins.win/raw?url=${url}`,
  (url: string) => url
];

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 21600000; // 6 hours

export function clearCache() {
  cache.clear();
}

export async function fetchWithFallback(url: string): Promise<Response> {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return new Response(JSON.stringify(cached.data), { status: 200 });
  }
  
  let lastError: Error | null = null;
  
  for (const proxy of PROXIES) {
    try {
      const response = await fetch(proxy(url));
      if (response.ok) {
        const clone = response.clone();
        const data = await clone.json();
        cache.set(url, { data, timestamp: Date.now() });
        return response;
      }
    } catch (error) {
      lastError = error as Error;
      continue;
    }
  }
  
  throw lastError || new Error('All proxies failed');
}
