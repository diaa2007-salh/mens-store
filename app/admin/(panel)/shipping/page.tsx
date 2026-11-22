import { SeedWilayasButton, ShippingRateRow } from "@/components/admin/shipping-controls";
import { db } from "@/lib/db";
import { requireAdminPage } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminShippingPage() {
  await requireAdminPage();
  const wilayas = await db().wilaya.findMany({
    select: {
      code: true,
      nameAr: true,
      nameFr: true,
      homePrice: true,
      deskPrice: true,
      isActive: true,
    },
    orderBy: { code: "asc" },
  });

  return (
    <>
      <div className="admin-page-heading">
        <div><span className="admin-eyebrow">إعدادات التوصيل</span><h1>الشحن والولايات</h1><p>{wilayas.length} ولاية مضافة</p></div>
        <SeedWilayasButton />
      </div>
      <div className="admin-card admin-panel-heading" style={{ padding: 14, marginBottom: 13 }}>
        <p>الأسعار بالدينار الجزائري. تغييرات التوصيل لا تؤثر على الطلبات المسجلة سابقاً.</p>
      </div>
      <section className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>الرمز</th><th>الولاية</th><th>إلى المنزل (دج)</th><th>إلى المكتب (دج)</th><th>الحالة</th><th>الإجراء</th></tr></thead>
            <tbody>
              {wilayas.map((wilaya) => <ShippingRateRow key={wilaya.code} wilaya={wilaya} />)}
              {wilayas.length === 0 && <tr><td className="admin-empty" colSpan={6}>لم تتم إضافة الولايات بعد. استخدم زر التهيئة بالأعلى.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
