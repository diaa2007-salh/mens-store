import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found-page" dir="rtl">
      <span className="eyebrow">404 · الصفحة غير موجودة</span>
      <h1>يبدو أنك سلكت طريقاً مختلفاً.</h1>
      <p>الصفحة التي تبحث عنها غير متاحة أو ربما نُقلت.</p>
      <Link className="button button-dark" href="/">العودة إلى الرئيسية</Link>
    </main>
  );
}
