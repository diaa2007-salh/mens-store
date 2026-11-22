import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { db } from "@/lib/db";
import { formatDzd } from "@/lib/format";
import { requireAdminPage } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

type ProductsAdminProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function AdminProductsPage({ searchParams }: ProductsAdminProps) {
  await requireAdminPage();
  const q = (await searchParams).q?.trim().slice(0, 100) ?? "";
  const products = await db().product.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      discountPrice: true,
      isActive: true,
      isFeatured: true,
      category: { select: { name: true } },
      variants: { select: { stock: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <>
      <div className="admin-page-heading">
        <div><span className="admin-eyebrow">إدارة الكتالوج</span><h1>المنتجات</h1><p>{products.length} منتجات</p></div>
        <Link className="admin-button admin-button-link" href="/admin/products/new"><Plus size={15} /> إضافة منتج</Link>
      </div>
      <form className="admin-card admin-filters" action="/admin/products">
        <label>البحث عن منتج
          <input name="q" defaultValue={q} placeholder="الاسم أو الرابط..." />
        </label>
        <button className="admin-button" type="submit"><Search size={14} /> بحث</button>
      </form>
      <section className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>المنتج</th><th>الفئة</th><th>السعر</th><th>المخزون</th><th>الظهور</th><th>الحالة</th><th>إجراءات</th></tr></thead>
            <tbody>
              {products.map((product) => {
                const stock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
                return (
                  <tr key={product.id}>
                    <td><Link className="admin-order-link" href={`/admin/products/${product.id}`}>{product.name}</Link><small className="shipping-name-fr" dir="ltr">{product.slug}</small></td>
                    <td>{product.category.name}</td>
                    <td>{formatDzd(product.discountPrice ?? product.price)}</td>
                    <td>{stock}</td>
                    <td>{product.isFeatured ? "مميز" : "—"}</td>
                    <td><span className={`status-pill ${product.isActive ? "status-confirmed" : "status-cancelled"}`}>{product.isActive ? "متاح" : "موقوف"}</span></td>
                    <td><Link className="admin-panel-link" href={`/admin/products/${product.id}`}>تعديل</Link></td>
                  </tr>
                );
              })}
              {products.length === 0 && <tr><td className="admin-empty" colSpan={7}>لا توجد منتجات مطابقة.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
