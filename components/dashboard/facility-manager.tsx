"use client";

import { FormEvent, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useFacilities, useKos, useKosMutation } from "@/lib/kos-data";
import { apiRequest } from "@/lib/query-client";
import { appToast } from "@/components/ui/app-toast";
import { ConfirmAction } from "@/components/dashboard/confirm-action";
import {
  FacilityIcon,
  facilityIcons,
} from "@/components/dashboard/facility-icon";

export function FacilityCatalog() {
  const query = useFacilities();
  const client = useQueryClient();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [iconSearch, setIconSearch] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function add(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      await apiRequest(editing ? `facilities/${editing}` : "facilities", {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify({ name, icon: icon || null }),
      });
      setName("");
      setIcon("");
      setEditing(null);
      await Promise.all([
        client.invalidateQueries({ queryKey: ["facilities"] }),
        client.invalidateQueries({ queryKey: ["kos"] }),
      ]);
      appToast.success(editing ? "Fasilitas berhasil diperbarui" : "Fasilitas berhasil ditambahkan");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Fasilitas gagal dibuat.";
      setError(message);
      appToast.error("Fasilitas gagal disimpan", message);
    } finally {
      setPending(false);
    }
  }

  async function remove(id: string, label: string) {
    try {
      await apiRequest(`facilities/${id}`, { method: "DELETE" });
      await Promise.all([
        client.invalidateQueries({ queryKey: ["facilities"] }),
        client.invalidateQueries({ queryKey: ["kos"] }),
      ]);
      appToast.success(`Fasilitas ${label} berhasil dihapus`);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Fasilitas gagal dihapus.";
      setError(message);
      appToast.error("Fasilitas gagal dihapus", message);
    }
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">KATALOG / FASILITAS</p>
          <h1>Fasilitas</h1>
          <p className="muted">
            Kelola daftar fasilitas yang dapat dipasang pada data kos.
          </p>
        </div>
      </div>
      <form className="facility-form" onSubmit={add}>
        <label>
          Nama fasilitas
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            maxLength={255}
          />
        </label>
        <div className="icon-picker-field">
          <span className="field-label">Pilih ikon</span>
          <div className="icon-picker-tools">
            <div className="selected-icon">
              <FacilityIcon
                value={icon}
                name={editing ? name : undefined}
                size={22}
              />
              <span>
                {facilityIcons.find((item) => item.value === icon)?.label ??
                  (editing && icon
                    ? `Ikon tersimpan: ${icon}`
                    : "Pilih ikon fasilitas")}
              </span>
            </div>
            <input
              aria-label="Cari ikon fasilitas"
              type="search"
              placeholder="Cari ikon"
              value={iconSearch}
              onChange={(event) => setIconSearch(event.target.value)}
            />
          </div>
          <div
            className="icon-picker-grid"
            role="group"
            aria-label="Pilihan ikon fasilitas"
          >
            {facilityIcons
              .filter((item) =>
                `${item.label} ${item.value}`
                  .toLocaleLowerCase("id-ID")
                  .includes(iconSearch.toLocaleLowerCase("id-ID")),
              )
              .map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  className={`icon-choice ${icon === value ? "selected" : ""}`}
                  onClick={() => setIcon(value)}
                  aria-label={label}
                  aria-pressed={icon === value}
                  title={label}
                >
                  <FacilityIcon value={value} size={20} />
                  <span>{label}</span>
                </button>
              ))}
          </div>
        </div>
        <div className="facility-form-actions">
          <button className="button button-primary" disabled={pending || !icon}>
            {pending
              ? "Menyimpan..."
              : editing
                ? "Simpan perubahan"
                : "Tambah fasilitas"}
          </button>
          {editing && (
            <button
              type="button"
              className="button button-quiet"
              onClick={() => {
                setEditing(null);
                setName("");
                setIcon("");
              }}
            >
              Batal
            </button>
          )}
        </div>
      </form>
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      {query.isPending ? (
        <p className="state-message">Memuat fasilitas...</p>
      ) : query.isError ? (
        <p className="error-message" role="alert">
          {query.error.message}
        </p>
      ) : !query.data?.data.length ? (
        <div className="empty-state">
          <h2>Belum ada fasilitas</h2>
          <p>Tambahkan fasilitas ke katalog.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ikon</th>
                <th>Nama fasilitas</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {query.data.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className="facility-icon-cell">
                      <FacilityIcon
                        value={item.icon}
                        name={item.name}
                        size={20}
                      />
                    </span>
                  </td>
                  <td className="table-primary">{item.name}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="button button-quiet"
                        onClick={() => {
                          setEditing(item.id);
                          setName(item.name);
                          setIcon(item.icon ?? "");
                        }}
                      >
                        Ubah
                      </button>
                      <ConfirmAction
                        title={`Hapus fasilitas ${item.name}?`}
                        description="Fasilitas ini akan dihapus dari katalog."
                        onConfirm={() => remove(item.id, item.name)}
                      >
                        <button
                          className="row-action danger-text"
                          aria-label={`Hapus ${item.name}`}
                        >
                          ×
                        </button>
                      </ConfirmAction>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export function KosFacilityManager({ id }: { id: string }) {
  const kos = useKos(id);
  const facilities = useFacilities();
  const detach = useKosMutation(`kos/${id}/facilities`, "DELETE", [
    ["kos", "detail", id],
    ["facilities"],
  ]);
  const client = useQueryClient();
  const [error, setError] = useState("");
  async function attach(facilityId: string) {
    try {
      await apiRequest(`kos/${id}/facilities`, {
        method: "POST",
        body: JSON.stringify({ facility_id: facilityId }),
      });
      await Promise.all([
        client.invalidateQueries({ queryKey: ["kos", "detail", id] }),
        client.invalidateQueries({ queryKey: ["facilities"] }),
      ]);
      appToast.success("Fasilitas berhasil dipasang");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Fasilitas gagal dipasang.";
      setError(message);
      appToast.error("Fasilitas gagal dipasang", message);
    }
  }
  async function detachOne(facilityId: string) {
    try {
      await apiRequest(`kos/${id}/facilities/${facilityId}`, {
        method: "DELETE",
      });
      await client.invalidateQueries({ queryKey: ["kos", "detail", id] });
      appToast.success("Fasilitas berhasil dilepas");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Fasilitas gagal dilepas.";
      setError(message);
      appToast.error("Fasilitas gagal dilepas", message);
    }
  }
  if (kos.isPending || facilities.isPending)
    return <p className="state-message">Memuat fasilitas...</p>;
  if (kos.isError || facilities.isError)
    return (
      <p role="alert" className="error-message">
        Data fasilitas gagal dimuat.
      </p>
    );
  const linked = kos.data.data.facilities ?? [];
  const available = facilities.data.data.filter(
    (item) => !linked.some((entry) => entry.id === item.id),
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">{kos.data.data.name} / FASILITAS</p>
          <h1>Fasilitas kos</h1>
          <p className="muted">Pasang atau lepas fasilitas dari kos ini.</p>
        </div>
      </div>
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      <section className="detail-section">
        <h2>
          Terpasang <span className="count-mark">{linked.length}</span>
        </h2>
        {linked.length ? (
          <div className="module-list">
            {linked.map((item) => (
              <div key={item.id}>
                <span className="facility-row-label">
                  <span className="facility-icon-cell">
                    <FacilityIcon value={item.icon} name={item.name} />
                  </span>
                  {item.name}
                </span>
                <ConfirmAction
                  title={`Lepas ${item.name} dari kos?`}
                  description="Fasilitas ini tidak akan lagi ditampilkan pada data kos."
                  confirmLabel="Lepas"
                  onConfirm={() => detachOne(item.id)}
                >
                  <button className="button button-quiet" disabled={detach.isPending}>
                    Lepas
                  </button>
                </ConfirmAction>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">Belum ada fasilitas terpasang.</p>
        )}
      </section>
      <section className="detail-section">
        <h2>Tambah dari katalog</h2>
        {available.length ? (
          <div className="module-list">
            {available.map((item) => (
              <div key={item.id}>
                <span className="facility-row-label">
                  <span className="facility-icon-cell">
                    <FacilityIcon value={item.icon} name={item.name} />
                  </span>
                  {item.name}
                </span>
                <button
                  className="button button-quiet"
                  onClick={() => attach(item.id)}
                >
                  Pasang
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">Semua fasilitas katalog sudah terpasang.</p>
        )}
      </section>
    </>
  );
}
