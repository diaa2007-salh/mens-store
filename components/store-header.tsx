"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/cart-store";

export function StoreHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const count = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );

  return (
    <header className="store-header">
      <div className="announcement">توصيل إلى 58 ولاية · الدفع عند الاستلام</div>
      <div className="header-main shell">
        <button
          className="icon-button mobile-menu-toggle"
          type="button"
          aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
          aria-expanded={menuOpen}
          aria-controls="store-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <Link className="brand" href="/" aria-label="مِداد، الصفحة الرئيسية">
          <span className="brand-mark">م</span>
          <span>مِداد<span className="brand-dot">.</span></span>
        </Link>
        <nav
          className={`store-navigation ${menuOpen ? "is-open" : ""}`}
          id="store-navigation"
          aria-label="التنقل الرئيسي"
        >
          <Link href="/products" onClick={() => setMenuOpen(false)}>تسوّق الكل</Link>
          <Link href="/products?category=clothing" onClick={() => setMenuOpen(false)}>ملابس</Link>
          <Link href="/products?category=shoes" onClick={() => setMenuOpen(false)}>أحذية</Link>
          <Link href="/products?category=accessories" onClick={() => setMenuOpen(false)}>إكسسوارات</Link>
        </nav>
        <Link className="cart-link" href="/cart" aria-label={`السلة، ${count} منتجات`}>
          <ShoppingBag size={19} />
          <span>السلة</span>
          <span className="cart-count" aria-live="polite">{count}</span>
        </Link>
      </div>
    </header>
  );
}
