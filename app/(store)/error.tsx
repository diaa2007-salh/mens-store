"use client";

import { useEffect } from "react";

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Store route failed.", error);
  }, [error]);

  return (
    <main className="not-found-page">
      <span className="eyebrow">حدث خلل</span>
      <h1>لم نتمكن من تحميل الصفحة.</h1>
      <p>يرجى المحاولة مرة أخرى بعد قليل.</p>
      <button className="button button-dark" type="button" onClick={reset}>إعادة المحاولة</button>
    </main>
  );
}
