export type PublicKos = {
    id: string;
    name: string;
    description?: string | null;
    address: string;
    province: string;
    city: string;
    district: string;
    subdistrict?: string | null;
    gmaps_link?: string | null;
    price_monthly: number;
    room_size?: number | null;
    total_rooms: number;
    available_rooms: number;
    minimum_rent_months: number;
    rules?: string | null;
    type: "mixed" | "man" | "woman";
    status: "draft" | "published" | "archived";
    cover_photo?: string | null;
    facilities?: Array<{ id: string; name: string; icon?: string | null }>;
    photos?: Array<{ id: string; image_url: string; public_id?: string | null }>;
    contact?: {
        kos_id: string;
        contact_name: string;
        phone: string;
        whatsapp?: string | null;
    } | null;
};

export type PublicKosListResponse = {
    data: PublicKos[];
    meta: { page: number; per_page: number; total: number; last_page: number };
};

export type PublicKosResponse = { data: PublicKos };

export class PublicKosApiError extends Error {
    constructor(
        message: string,
        public readonly status?: number,
    ) {
        super(message);
        this.name = "PublicKosApiError";
    }
}

const DEFAULT_API_BASE_URL = "http://localhost:3000/api/v1";

function getPublicApiUrl(path: string) {
    const baseUrl = (
        process.env.API_BASE_URL ||
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        DEFAULT_API_BASE_URL
    ).replace(/\/+$/, "");
    return `${baseUrl}/${path.replace(/^\/+/, "")}`;
}

async function request<T>(path: string, retryKey?: string): Promise<T> {
    const url = new URL(getPublicApiUrl(path));
    if (retryKey) url.searchParams.set("retry", retryKey);

    let response: Response;
    try {
        response = await fetch(url, { cache: "no-store" });
    } catch (error) {
        const reason = error instanceof Error ? ` ${error.message}` : "";
        throw new PublicKosApiError(`Layanan data kos tidak dapat dijangkau.${reason}`);
    }

    if (!response.ok) {
        throw new PublicKosApiError(
            `Data kos gagal dimuat (HTTP ${response.status}).`,
            response.status,
        );
    }

    try {
        return (await response.json()) as T;
    } catch {
        throw new PublicKosApiError("Respons data kos tidak dapat dibaca.");
    }
}

export function getPublicKosList(
    page: number,
    perPage: number,
    retryKey?: string,
) {
    const query = new URLSearchParams({
        page: String(page),
        per_page: String(perPage),
    });
    return request<PublicKosListResponse>(`public/kos?${query}`, retryKey);
}

export function getPublicKos(id: string, retryKey?: string) {
    return request<PublicKosResponse>(`public/kos/${encodeURIComponent(id)}`, retryKey);
}
