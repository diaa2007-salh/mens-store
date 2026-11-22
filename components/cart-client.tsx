"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatDzd } from "@/lib/format";
import { useCartStore } from "@/store/cart-store";

export function CartClient() {
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">✳</span>
        <h1>سلتك بانتظار اختياراتك</h1>
        <p>اكتشف القطع التي اخترناها لك بعناية.</p>
        <Link className="button button-dark" href="/products">تصفّح المنتجات</Link>
      </div>
    );
  }

  return (
    <div className="cart-layout">
      <div className="cart-lines">
        {items.map((item) => (
          <article className="cart-line" key={item.variantId}>
            <Link className="cart-line-image" href={`/products/${item.slug}`}>
              {item.image && <Image src={item.image} alt={item.productName} fill unoptimized sizes="112px" />}
            </Link>
            <div className="cart-line-info">
              <Link href={`/products/${item.slug}`} className="cart-line-name">{item.productName}</Link>
              <span>{item.color} · {item.size}</span>
              <strong>{formatDzd(item.unitPrice)}</strong>
              <div className="quantity-control small">
                <button type="button" aria-label="تقليل الكمية" onClick={() => setQuantity(item.variantId, item.quantity - 1)}><Minus size={13} /></button>
                <span aria-live="polite">{item.quantity}</span>
                <button type="button" aria-label="زيادة الكمية" onClick={() => setQuantity(item.variantId, item.quantity + 1)}><Plus size={13} /></button>
              </div>
            </div>
            <button
              type="button"
              className="icon-button remove-item"
              aria-label={`إزالة ${item.productName} من السلة`}
              onClick={() => removeItem(item.variantId)}
            >
              <Trash2 size={17} />
            </button>
          </article>
        ))}
      </div>
      <aside className="cart-summary">
        <h2>ملخص الطلب</h2>
        <div className="summary-row"><span>المجموع الفرعي</span><strong>{formatDzd(subtotal)}</strong></div>
        <div className="summary-row"><span>التوصيل</span><span>يُحسب عند الدفع</span></div>
        <div className="summary-total"><span>الإجمالي</span><strong>{formatDzd(subtotal)}</strong></div>
        <p>السعر النهائي والتوصيل يؤكّدان قبل إتمام الطلب.</p>
        <Link className="button button-dark button-full" href="/checkout">متابعة إلى الدفع</Link>
        <Link className="continue-shopping" href="/products">متابعة التسوق</Link>
      </aside>
    </div>
  );
}
