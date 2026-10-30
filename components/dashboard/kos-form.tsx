"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/query-client";
import { Kos } from "@/lib/kos-data";
import { appToast } from "@/components/ui/app-toast";

export function KosForm({ kos }: { kos?: Kos }) {
  const router = useRouter();
  const client = useQueryClient();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const payload = {
      ...values,
      price_monthly: Number(values.price_monthly),
      room_size: values.room_size ? Number(values.room_size) : null,
      total_rooms: Number(values.total_rooms || 0),
      available_rooms: Number(values.available_rooms || 0),
      minimum_rent_months: Number(values.minimum_rent_months || 1),
      subdistrict: values.subdistrict || null,
      gmaps_link: values.gmaps_link || null,
      description: values.description || null,
      rules: values.rules || null,
    };
    try {
      const result = await apiRequest<{ data: Kos }>(
        kos ? `kos/${kos.id}` : "kos",
        {
          method: kos ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
      );
      await client.invalidateQueries({ queryKey: ["kos"] });
      appToast.success(kos ? "Data kos diperbarui" : "Kos berhasil ditambahkan");
      router.push(`/dashboard/kos/${result.data.id}`);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Data kos gagal disimpan.";
      setError(message);
      appToast.error("Data kos gagal disimpan", message);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">DATA KOS / {kos ? "UBAH" : "BARU"}</p>
          <h1>{kos ? "Ubah informasi kos" : "Tambah kos"}</h1>
          <p className="muted">Isi informasi sesuai kondisi kos saat ini.</p>
        </div>
      </div>
      <form className="w-full bg-white" onSubmit={submit}>
        <div className="form-section">
          <h2>Informasi utama</h2>
          <label>
            Nama kos
            <input
              name="name"
              defaultValue={kos?.name}
              required
              maxLength={255}
            />
          </label>
          <label>
            Alamat lengkap
            <textarea
              name="address"
              defaultValue={kos?.address}
              required
              rows={2}
            />
          </label>
          <div className="form-grid three">
            <label>
              Provinsi
              <input
                name="province"
                defaultValue={kos?.province}
                required
                maxLength={255}
              />
            </label>
            <label>
              Kota/kabupaten
              <input
                name="city"
                defaultValue={kos?.city}
                required
                maxLength={255}
              />
            </label>
            <label>
              Kecamatan
              <input
                name="district"
                defaultValue={kos?.district}
                required
                maxLength={255}
              />
            </label>
          </div>
          <label>
            Kelurahan
            <input name="subdistrict" defaultValue={kos?.subdistrict ?? ""} />
          </label>
          <label>
            Tautan Google Maps
            <input
              name="gmaps_link"
              type="url"
              defaultValue={kos?.gmaps_link ?? ""}
            />
          </label>
          <label>
            Deskripsi
            <textarea
              name="description"
              defaultValue={kos?.description ?? ""}
              rows={3}
            />
          </label>
        </div>
        <div className="form-section">
          <h2>Harga dan kamar</h2>
          <div className="form-grid three">
            <label>
              Harga per bulan (Rp)
              <input
                name="price_monthly"
                type="number"
                min="1"
                defaultValue={kos?.price_monthly}
                required
              />
            </label>
            <label>
              Ukuran kamar (m²)
              <input
                name="room_size"
                type="number"
                min="1"
                defaultValue={kos?.room_size ?? ""}
              />
            </label>
            <label>
              Total kamar
              <input
                name="total_rooms"
                type="number"
                min="0"
                defaultValue={kos?.total_rooms ?? 0}
                required
              />
            </label>
          </div>
          <div className="form-grid three">
            <label>
              Kamar tersedia
              <input
                name="available_rooms"
                type="number"
                min="0"
                defaultValue={kos?.available_rooms ?? 0}
                required
              />
            </label>
            <label>
              Minimum sewa (bulan)
              <input
                name="minimum_rent_months"
                type="number"
                min="1"
                defaultValue={kos?.minimum_rent_months ?? 1}
                required
              />
            </label>
            <label>
              Tipe kos
              <select name="type" defaultValue={kos?.type ?? "mixed"}>
                <option value="mixed">Campur</option>
                <option value="man">Putra</option>
                <option value="woman">Putri</option>
              </select>
            </label>
          </div>
          <label>
            Status
            <select
              name="status"
              defaultValue={
                kos?.status === "archived" ? "draft" : (kos?.status ?? "draft")
              }
            >
              <option value="draft">Draft</option>
              <option value="published">Dipublikasikan</option>
              {!kos && <option value="archived">Diarsipkan</option>}
            </select>
          </label>
          <label>
            Peraturan
            <textarea name="rules" defaultValue={kos?.rules ?? ""} rows={3} />
          </label>
        </div>
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
        <div className="form-actions">
          <Link
            href={kos ? `/dashboard/kos/${kos.id}` : "/dashboard/kos"}
            className="button button-quiet"
          >
            Batal
          </Link>
          <button className="button button-primary" disabled={pending}>
            {pending ? "Menyimpan..." : "Simpan kos"}
          </button>
        </div>
      </form>
    </>
  );
}
