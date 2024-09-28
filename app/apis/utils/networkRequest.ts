import { createHash } from "node:crypto";

const CACHE_ENABLED = true;

const AUTH_HEADER = "c61de580-e48d-41d2-a8d1-6cd1429987a1";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache: Record<string, any> = {};

export type ApiRequestOptions = {
  headers: Record<string, string>;
  body?: Record<string, string | number | boolean>;
  cache?: true;
};

export type NetworkRequestOptions = {
  pathname: string;
  method?: "POST" | "GET" | "PUT" | "DELETE";
} & ApiRequestOptions;

export async function networkRequest(payload: NetworkRequestOptions) {
  const start = performance.now();
  const { method, pathname, headers, body } = payload;

  if (CACHE_ENABLED && payload.cache) {
    const cacheKey = getCacheKey(payload);

    if (cache[cacheKey]) {
      const end = performance.now();

      console.info(`[API] ${method ?? "GET"} ${pathname}`, {
        took: `${Math.round(end - start)}ms`,
        status: "cached",
      });

      return cache[cacheKey];
    }
  }

  const fetchOptions: RequestInit = {
    method: method ?? "GET",
    credentials: "include",
    headers: {
      Authorization: AUTH_HEADER,
      ...headers,
    },
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(
    `https://api.staging.hungryroot.com${pathname}`,
    fetchOptions
  );

  const end = performance.now();

  console.info(`[API] ${method ?? "GET"} ${pathname}`, {
    took: `${Math.round(end - start)}ms`,
    status: response.status,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${pathname}`);
  }

  const json = response.json();

  // Request is cacheable
  if (CACHE_ENABLED && payload.cache) {
    const cacheKey = getCacheKey(payload);
    cache[cacheKey] = json;
  }

  return json;
}

const md5 = (str: string) => createHash("md5").update(str).digest("hex");

export const getCacheKey = (options: NetworkRequestOptions) => {
  return md5(JSON.stringify(options));
};
