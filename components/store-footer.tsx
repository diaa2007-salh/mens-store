import Link from "next/link";

export function StoreFooter() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  return (
    <footer className="store-footer">
      <div className="shell footer-inner">
        <div>
          <Link className="brand footer-brand" href="/">
            <span className="brand-mark">م</span>
            <span>مِداد<span className="brand-dot">.</span></span>
          </Link>
          <p>اختيارات يومية للرجل الذي يقدّر البساطة والجودة.</p>
        </div>
        <div className="footer-links">
          <Link href="/products">تسوّق المنتجات</Link>
          <Link href="/cart">سلة المشتريات</Link>
          {whatsappNumber
            ? <a href={`https://wa.me/${whatsappNumber}`}>تواصل معنا</a>
            : <span>توصيل إلى جميع الولايات</span>}
        </div>
        <span className="copyright">© {new Date().getFullYear()} مِداد</span>
      </div>
    </footer>
  );
}
