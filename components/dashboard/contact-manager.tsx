"use client";

import { FormEvent, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useContact, useKos } from "@/lib/kos-data";
import { apiRequest } from "@/lib/query-client";
import { appToast } from "@/components/ui/app-toast";
import { ConfirmAction } from "@/components/dashboard/confirm-action";

export function ContactManager({ id }: { id: string }) {
  const kos = useKos(id);
  const contact = useContact(id);
  const client = useQueryClient();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await apiRequest(`kos/${id}/contacts`, {
        method: contact.data ? "PUT" : "POST",
        body: JSON.stringify({ ...values, whatsapp: values.whatsapp || null }),
      });
      await Promise.all([
        client.invalidateQueries({ queryKey: ["kos", id, "contact"] }),
        client.invalidateQueries({ queryKey: ["kos", "detail", id] }),
      ]);
      appToast.success("Kontak berhasil disimpan");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Kontak gagal disimpan.";
      setError(message);
      appToast.error("Kontak gagal disimpan", message);
    } finally {
      setPending(false);
    }
  }
  async function remove() {
    try {
      await apiRequest(`kos/${id}/contacts`, { method: "DELETE" });
      await Promise.all([
        client.invalidateQueries({ queryKey: ["kos", id, "contact"] }),
        client.invalidateQueries({ queryKey: ["kos", "detail", id] }),
      ]);
      appToast.success("Kontak berhasil dihapus");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Kontak gagal dihapus.";
      setError(message);
      appToast.error("Kontak gagal dihapus", message);
    }
  }
  if (kos.isPending || contact.isPending)
    return <p className="state-message">Memuat kontak...</p>;
  if (kos.isError)
    return (
      <p className="error-message" role="alert">
        Data kos gagal dimuat.
      </p>
    );
  if (contact.isError && contact.error.status !== 404)
    return (
      <p className="error-message" role="alert">
        {contact.error.message}
        <button
          className="button button-quiet"
          onClick={() => contact.refetch()}
        >
          Coba lagi
        </button>
      </p>
    );
  const existing = contact.isError ? undefined : contact.data?.data;
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">{kos.data.data.name} / KONTAK</p>
          <h1>Kontak kos</h1>
          <p className="muted">Informasi yang ditampilkan pada data kos.</p>
        </div>
      </div>
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      <form className="bg-white w-full " onSubmit={save}>
        <div className="form-section">
          <h2>Informasi </h2>
          <label>
            Nama kontak
            <input
              name="contact_name"
              defaultValue={existing?.contact_name ?? ""}
              required
              maxLength={255}
            />
          </label>
          <label>
            Nomor telepon
            <input
              name="phone"
              type="tel"
              defaultValue={existing?.phone ?? ""}
              required
              maxLength={50}
            />
          </label>
          <label>
            WhatsApp (opsional)
            <input
              name="whatsapp"
              type="tel"
              defaultValue={existing?.whatsapp ?? ""}
              maxLength={50}
            />
          </label>
        </div>
        <div className="form-actions">
          {existing && (
            <ConfirmAction
              title="Hapus informasi kontak?"
              description="Informasi kontak ini akan dihapus dari data kos."
              onConfirm={remove}
            >
              <button type="button" className="button button-danger-quiet">
                Hapus kontak
              </button>
            </ConfirmAction>
          )}
          <button className="button button-primary" disabled={pending}>
            {pending ? "Menyimpan..." : "Simpan kontak"}
          </button>
        </div>
      </form>
    </>
  );
}
