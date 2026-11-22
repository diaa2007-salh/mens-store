import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "إتمام الطلب" };

export default async function CheckoutPage() {
  const wilayas = await db().wilaya.findMany({
    where: { isActive: true },
    select: { code: true, nameAr: true, homePrice: true, deskPrice: true },
    orderBy: { code: "asc" },
  });

  return (
    <div className="shell checkout-page">
      <div className="page-title">
        <span className="eyebrow">خطوة أخيرة</span>
        <h1>أكمل طلبك.</h1>
        <p>أدخل معلوماتك وسنتواصل معك لتأكيد التوصيل.</p>
      </div>
      {wilayas.length ? (
        <CheckoutForm wilayas={wilayas} />
      ) : (
        <div className="empty-state compact-empty">
          <h2>خيارات التوصيل غير متاحة حالياً.</h2>
          <p>يرجى المحاولة لاحقاً أو التواصل معنا.</p>
        </div>
      )}
    </div>
  );
}
