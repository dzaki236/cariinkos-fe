"use client";

import { useRouter } from "next/navigation";

export function PublicRetryLink({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) {
  const router = useRouter();

  return (
    <button
      className="public-action"
      type="button"
      onClick={() => {
        const url = new URL(href, window.location.origin);
        url.searchParams.set("retry", String(Date.now()));
        router.push(`${url.pathname}${url.search}`);
      }}
    >
      {children}
    </button>
  );
}
