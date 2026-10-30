import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, queryKeys } from "@/lib/query-client";

export type Kos = {
  id: string;
  name: string;
  address: string;
  province: string;
  city: string;
  district: string;
  subdistrict?: string | null;
  gmaps_link?: string | null;
  description?: string | null;
  rules?: string | null;
  price_monthly: number;
  room_size?: number | null;
  available_rooms: number;
  total_rooms: number;
  status: string;
  type?: string;
  minimum_rent_months?: number;
  cover_photo?: string;
  facilities?: Facility[];
  photos?: KosPhoto[];
  contact?: KosContact;
};

export type Facility = { id: string; name: string; icon?: string | null };
export type KosPhoto = { id: string; image_url: string; public_id: string };
export type KosContact = {
  kos_id: string;
  contact_name: string;
  phone: string;
  whatsapp?: string | null;
};
type KosList = {
  data: Kos[];
  meta: { page: number; per_page: number; total: number; last_page: number };
};
type DataList<T> = { data: T[] };
type DataItem<T> = { data: T };

export const useKosList = (page: number, perPage: number) =>
  useQuery({
    queryKey: queryKeys.kosList(page, perPage),
    queryFn: () => apiRequest<KosList>(`kos?page=${page}&per_page=${perPage}`),
  });

export const useKos = (id: string) =>
  useQuery({
    queryKey: queryKeys.kosDetail(id),
    queryFn: () => apiRequest<DataItem<Kos>>(`kos/${id}`),
    enabled: Boolean(id),
  });

export const useFacilities = () =>
  useQuery({
    queryKey: queryKeys.facilities,
    queryFn: () => apiRequest<DataList<Facility>>("facilities"),
  });

export function useKosMutation<TBody>(
  path: string,
  method: "POST" | "PUT" | "DELETE",
  invalidate: readonly unknown[][],
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body?: TBody) =>
      apiRequest(path, {
        method,
        body: method === "DELETE" ? undefined : JSON.stringify(body),
      }),
    onSuccess: async () => {
      await Promise.all(
        invalidate.map((queryKey) => client.invalidateQueries({ queryKey })),
      );
    },
  });
}

export function usePhotos(id: string) {
  return useQuery({
    queryKey: queryKeys.photos(id),
    queryFn: () => apiRequest<DataList<KosPhoto>>(`kos/${id}/photos`),
    enabled: Boolean(id),
  });
}

export function useContact(id: string) {
  return useQuery({
    queryKey: queryKeys.contact(id),
    queryFn: () => apiRequest<DataItem<KosContact>>(`kos/${id}/contacts`),
    enabled: Boolean(id),
  });
}
