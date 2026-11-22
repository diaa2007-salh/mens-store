"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { createOrder } from "@/app/actions/orders";
import { formatDzd } from "@/lib/format";
import { useCartStore } from "@/store/cart-store";

type CheckoutWilaya = {
  code: string;
  nameAr: string;
  homePrice: number;
  deskPrice: number;
};

export function CheckoutForm({ wilayas }: { wilayas: CheckoutWilaya[] }) {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);
  const [deliveryType, setDeliveryType] = useState<"HOME" | "DESK">("HOME");
  const [wilayaCode, setWilayaCode] = useState(wilayas[0]?.code ?? "");
  const [pending, startTransition] = useTransition();
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const wilaya = wilayas.find((item) => item.code === wilayaCode);
  const shipping = wilaya
    ? deliveryType === "HOME" ? wilaya.homePrice : wilaya.deskPrice
    : 0;

  function submit(formData: FormData) {
    if (items.length === 0) {
      toast.error("سلتك فارغة.");
      return;
    }

    startTransition(async () => {
      const result = await createOrder({
        items: items.map(({ variantId, quantity }) => ({ variantId, quantity })),
        customerName: String(formData.get("customerName") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        email: String(formData.get("email") ?? ""),
        address: String(formData.get("address") ?? ""),
        customerNote: String(formData.get("customerNote") ?? ""),
        wilayaCode,
        deliveryType,
        website: String(formData.get("website") ?? ""),
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("تم استلام طلبك بنجاح.");
      clear();
      router.push(`/order-confirmation?order=${encodeURIComponent(result.data.orderNumber)}`);
    });
  }

  if (items.length === 0) {
    return (
      <div className="empty-state compact-empty">
        <h2>لا توجد منتجات في سلتك</h2>
        <Link className="button button-dark" href="/products">تصفّح المنتجات</Link>
      </div>
    );
  }

  return (
    <form action={submit} className="checkout-layout">
      <div className="checkout-fields">
        <section className="checkout-section">
          <span className="step-number">01</span>
          <div className="checkout-section-heading">
            <h2>معلومات التواصل</h2><p>سنستخدمها لتأكيد وتوصيل طلبك.</p>
          </div>
          <label className="field-label" htmlFor="customerName">الاسم الكامل</label>
          <input id="customerName" name="customerName" autoComplete="name" required maxLength={100} />
          <label className="field-label" htmlFor="phone">رقم الهاتف</label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" required maxLength={24} placeholder="05 XX XX XX XX" />
          <label className="field-label" htmlFor="email">البريد الإلكتروني <span>اختياري</span></label>
          <input id="email" name="email" type="email" autoComplete="email" maxLength={254} />
        </section>

        <section className="checkout-section">
          <span className="step-number">02</span>
          <div className="checkout-section-heading">
            <h2>عنوان التوصيل</h2><p>اختر الولاية وطريقة التوصيل المناسبة.</p>
          </div>
          <label className="field-label" htmlFor="wilaya">الولاية</label>
          <select
            id="wilaya"
            value={wilayaCode}
            onChange={(event) => setWilayaCode(event.target.value)}
            required
          >
            <option value="" disabled>اختر ولايتك</option>
            {wilayas.map((item) => <option value={item.code} key={item.code}>{item.code} · {item.nameAr}</option>)}
          </select>
          <fieldset className="delivery-options">
            <legend>طريقة التوصيل</legend>
            <label className={`delivery-option ${deliveryType === "HOME" ? "selected" : ""}`}>
              <input
                type="radio"
                name="delivery"
                value="HOME"
                checked={deliveryType === "HOME"}
                onChange={() => setDeliveryType("HOME")}
              />
              <span><strong>توصيل إلى المنزل</strong><small>إلى عنوانك مباشرة</small></span>
              <b>{wilaya ? formatDzd(wilaya.homePrice) : "—"}</b>
            </label>
            <label className={`delivery-option ${deliveryType === "DESK" ? "selected" : ""}`}>
              <input
                type="radio"
                name="delivery"
                value="DESK"
                checked={deliveryType === "DESK"}
                onChange={() => setDeliveryType("DESK")}
              />
              <span><strong>استلام من المكتب</strong><small>من مكتب شركة التوصيل</small></span>
              <b>{wilaya ? formatDzd(wilaya.deskPrice) : "—"}</b>
            </label>
          </fieldset>
          <label className="field-label" htmlFor="address">العنوان بالتفصيل</label>
          <textarea id="address" name="address" rows={3} autoComplete="street-address" required maxLength={240} placeholder="البلدية، الحي، الشارع ورقم المنزل" />
          <label className="field-label" htmlFor="customerNote">ملاحظة للطلب <span>اختياري</span></label>
          <textarea id="customerNote" name="customerNote" rows={2} maxLength={500} />
          <label className="honeypot" aria-hidden="true">
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </section>
      </div>
      <aside className="cart-summary checkout-summary">
        <h2>طلبك</h2>
        <div className="checkout-summary-items">
          {items.map((item) => (
            <div className="checkout-mini-item" key={item.variantId}>
              <span className="mini-quantity">{item.quantity}</span>
              <span>{item.productName} <small>{item.size} · {item.color}</small></span>
              <strong>{formatDzd(item.unitPrice * item.quantity)}</strong>
            </div>
          ))}
        </div>
        <div className="summary-row"><span>المجموع الفرعي</span><strong>{formatDzd(subtotal)}</strong></div>
        <div className="summary-row"><span>التوصيل</span><strong>{formatDzd(shipping)}</strong></div>
        <div className="summary-total"><span>الإجمالي التقديري</span><strong>{formatDzd(subtotal + shipping)}</strong></div>
        <p>الدفع نقداً عند الاستلام. يتم تأكيد السعر والتوفر من الخادم.</p>
        <button className="button button-dark button-full" type="submit" disabled={pending || !wilayaCode}>
          {pending ? "جارٍ إرسال الطلب..." : "تأكيد الطلب"}
        </button>
      </aside>
    </form>
  );
}
