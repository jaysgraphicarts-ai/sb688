export type StitchBootStatus = {
  ok: boolean;
  missing: string[];
  mode: string;
  requiresApiKeys: boolean;
  requiresPaidSubscriptions: boolean;
  requiresNetwork: boolean;
};

export type StitchClipBrick = {
  id: string;
  name: string;
  version: string;
  lane: string;
  status: string;
  capabilities: string[];
  risk: string;
};

export type SovereignAdapter = {
  id: string;
  name: string;
  category: string;
  requiresNetwork: boolean;
  requiresApiKey: boolean;
  enabledByDefault: boolean;
  fallback: string;
  rule: string;
};

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json() as Promise<T>;
}

export const stitchApi = {
  boot: () => api<StitchBootStatus>("/api/stitch/sovereign/boot"),
  policy: () => api<{ principle: string; externalDependencyRule: string; adapters: unknown[] }>("/api/stitch/sovereign/policy"),
  clipBricks: () => api<{ bricks: StitchClipBrick[] }>("/api/stitch/clip-bricks"),
  adapters: () => api<{ adapters: SovereignAdapter[]; runnable: SovereignAdapter[] }>("/api/stitch/sovereign/adapters"),
  promptCard: () => api<unknown>("/api/stitch/prompt-card"),
  connect: (prompt: string, handshakeCode: string) =>
    api<unknown>("/api/stitch/connect", {
      method: "POST",
      body: JSON.stringify({ prompt, handshakeCode }),
    }),
};
