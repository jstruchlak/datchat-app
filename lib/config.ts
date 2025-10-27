// lib/config.ts
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  appName: "Spend Analytix",
  version: "1.0.0",
};

export function getApiEndpoint(path: string): string {
  return `${config.apiUrl}${path}`;
}
