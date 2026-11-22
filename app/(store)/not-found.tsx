import Link from "next/link";

export default function StoreNotFound() {
  return (
    <div className="not-found-page">
      <span className="eyebrow">404</span>
      <h1>لم نجد ما تبحث عنه.</h1>
      <p>قد يكون المنتج قد نفد أو لم يعد متاحاً.</p>
      <Link href="/products" className="button button-dark">اكتشف المنتجات</Link>
    </div>
  );
}
