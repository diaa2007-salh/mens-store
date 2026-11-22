"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin route failed.", error);
  }, [error]);

  return (
    <div className="admin-loading">
      <div>
        <h2>تعذّر تحميل الصفحة.</h2>
        <p>يرجى المحاولة مرة أخرى.</p>
        <button className="admin-button" type="button" onClick={reset}>إعادة المحاولة</button>
      </div>
    </div>
  );
}
