"use client";

import { ReactElement } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const SweetAlert = withReactContent(Swal);

export function ConfirmAction({
  title,
  description,
  confirmLabel = "Hapus",
  children,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  children: ReactElement;
  onConfirm: () => void | Promise<void>;
}) {
  async function confirm() {
    const result = await SweetAlert.fire({
      title,
      text: description,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: confirmLabel,
      cancelButtonText: "Batal",
      reverseButtons: true,
      focusCancel: true,
    });

    if (result.isConfirmed) {
      await onConfirm();
    }
  }

  return (
    <span
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void confirm();
      }}
    >
      {children}
    </span>
  );
}
