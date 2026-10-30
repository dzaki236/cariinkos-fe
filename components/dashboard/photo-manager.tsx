"use client";

import { ChangeEvent, useRef, useState } from "react";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import { useKos, usePhotos } from "@/lib/kos-data";
import { apiRequest } from "@/lib/query-client";
import { appToast } from "@/components/ui/app-toast";
import { ConfirmAction } from "@/components/dashboard/confirm-action";

const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];
const maxBytes = 10 * 1024 * 1024;

export function PhotoManager({ id }: { id: string }) {
  const kos = useKos(id);
  const photos = usePhotos(id);
  const client = useQueryClient();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  async function upload(file: File, photoId?: string) {
    setError("");
    if (
      !acceptedTypes.includes(file.type) ||
      file.size < 1 ||
      file.size > maxBytes
    ) {
      const message = "Pilih JPEG, PNG, atau WebP dengan ukuran maksimal 10 MB.";
      setError(message);
      appToast.warning("Format atau ukuran foto tidak sesuai", message);
      return;
    }
    setBusy(true);
    const body = new FormData();
    body.append("photo", file);
    try {
      await apiRequest(`kos/${id}/photos${photoId ? `/${photoId}` : ""}`, {
        method: photoId ? "PUT" : "POST",
        body,
      });
      await Promise.all([
        client.invalidateQueries({ queryKey: ["kos", id, "photos"] }),
        client.invalidateQueries({ queryKey: ["kos", "detail", id] }),
      ]);
      appToast.success(photoId ? "Foto berhasil diperbarui" : "Foto berhasil diunggah");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Foto gagal diunggah.";
      setError(message);
      appToast.error("Foto gagal diunggah", message);
    } finally {
      setBusy(false);
    }
  }

  async function choose(
    event: ChangeEvent<HTMLInputElement>,
    photoId?: string,
  ) {
    const file = event.target.files?.[0];
    if (file) await upload(file, photoId);
    event.target.value = "";
  }

  async function remove(photoId: string) {
    try {
      await apiRequest(`kos/${id}/photos/${photoId}`, { method: "DELETE" });
      await Promise.all([
        client.invalidateQueries({ queryKey: ["kos", id, "photos"] }),
        client.invalidateQueries({ queryKey: ["kos", "detail", id] }),
      ]);
      appToast.success("Foto berhasil dihapus");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Foto gagal dihapus.";
      setError(message);
      appToast.error("Foto gagal dihapus", message);
    }
  }

  if (kos.isPending || photos.isPending)
    return <p className="state-message">Memuat foto kos...</p>;
  if (kos.isError || photos.isError)
    return (
      <p className="error-message" role="alert">
        Data foto gagal dimuat.
      </p>
    );
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">{kos.data.data.name} / FOTO</p>
          <h1>Foto kos</h1>
          <p className="muted">
            JPEG, PNG, atau WebP · maksimal 10 MB per foto.
          </p>
        </div>
        <label
          className={`button button-primary upload-button ${busy ? "disabled" : ""}`}
        >
          Unggah foto
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy}
            onChange={(event) => choose(event)}
          />
        </label>
      </div>
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      {!photos.data.data.length ? (
        <div className="empty-state">
          <h2>Belum ada foto</h2>
          <p>Unggah foto untuk melengkapi informasi kos.</p>
        </div>
      ) : (
        <div className="photo-grid">
          {photos.data.data.map((photo) => (
            <article className="photo-item" key={photo.id}>
              <Image
                src={photo.image_url}
                alt={`Foto ${kos.data.data.name}`}
                width={640}
                height={480}
                unoptimized
              />
              <div className="photo-actions">
                <button
                  className="button button-quiet"
                  disabled={busy}
                  onClick={() => fileRefs.current[photo.id]?.click()}
                >
                  Ganti
                </button>
                <input
                  ref={(node) => {
                    fileRefs.current[photo.id] = node;
                  }}
                  className="visually-hidden"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => choose(event, photo.id)}
                />
                <ConfirmAction
                  title="Hapus foto ini?"
                  description="Foto akan dihapus dari galeri kos dan tidak dapat dipulihkan."
                  onConfirm={() => remove(photo.id)}
                >
                  <button className="button button-quiet danger-text">
                    Hapus
                  </button>
                </ConfirmAction>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
