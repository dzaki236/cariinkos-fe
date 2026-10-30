export type ApiError = Error & {
  status?: number;
  fields?: Record<string, string[]>;
};

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`/api/backend/${path}`, {
    ...init,
    cache: "no-store",
    headers:
      init?.body instanceof FormData
        ? init.headers
        : { "Content-Type": "application/json", ...init?.headers },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message ?? "Permintaan gagal") as ApiError;
    error.status = response.status;
    error.fields = payload.errors;
    throw error;
  }
  return payload as T;
}

export const queryKeys = {
  kos: ["kos"] as const,
  kosList: (page: number, perPage: number) =>
    ["kos", "list", page, perPage] as const,
  kosDetail: (id: string) => ["kos", "detail", id] as const,
  facilities: ["facilities"] as const,
  photos: (id: string) => ["kos", id, "photos"] as const,
  contact: (id: string) => ["kos", id, "contact"] as const,
};
