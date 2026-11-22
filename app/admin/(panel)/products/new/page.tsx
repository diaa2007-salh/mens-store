import Link from "next/link";
import { AdminProductEditor } from "@/components/admin/admin-product-editor";
import { db } from "@/lib/db";
import { requireAdminPage } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireAdminPage();
  const categories = await db().category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <div className="admin-page-heading">
        <div><Link className="admin-panel-link" href="/admin/products">← المنتجات</Link><h1>إضافة منتج</h1></div>
      </div>
      {categories.length ? (
        <AdminProductEditor categories={categories} />
      ) : (
        <div className="admin-card admin-empty">لا توجد فئات. أضف الفئات من خلال تشغيل بيانات التهيئة.</div>
      )}
    </>
  );
}
