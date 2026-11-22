import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type ProductsPageProps = {
  searchParams: Promise<{ category?: string; q?: string }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const q = params.q?.trim().slice(0, 100) ?? "";
  const categorySlug = params.category?.trim().slice(0, 80);

  const [products, categories, selectedCategory] = await Promise.all([
    db().product.findMany({
      where: {
        isActive: true,
        ...(categorySlug ? { category: { slug: categorySlug } } : {}),
        ...(q ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        } : {}),
      },
      include: {
        category: { select: { name: true, slug: true } },
        images: { orderBy: { position: "asc" }, take: 1, select: { url: true, alt: true } },
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    }),
    db().category.findMany({
      where: { products: { some: { isActive: true } } },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    categorySlug
      ? db().category.findUnique({ where: { slug: categorySlug }, select: { name: true } })
      : Promise.resolve(null),
  ]);

  return (
    <div className="shell catalog-page">
      <div className="catalog-heading">
        <div>
          <div className="breadcrumbs"><Link href="/">الرئيسية</Link><span>/</span><span>المنتجات</span></div>
          <span className="eyebrow">تشكيلة مِداد</span>
          <h1>{selectedCategory?.name ?? "كل ما تحتاجه، ببساطة."}</h1>
          <p>قطع مختارة لتبقى أنيقة وعملية في كل يوم.</p>
        </div>
        <form action="/products" className="search-form" role="search">
          {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
          <label htmlFor="product-search">ابحث عن منتج</label>
          <input id="product-search" name="q" defaultValue={q} placeholder="مثال: قميص، حذاء..." />
          <button type="submit">بحث</button>
        </form>
      </div>
      <nav className="category-filter" aria-label="تصفية حسب الفئة">
        <Link className={!categorySlug ? "active" : ""} href="/products">الكل</Link>
        {categories.map((category) => (
          <Link className={categorySlug === category.slug ? "active" : ""} href={`/products?category=${category.slug}`} key={category.id}>
            {category.name}
          </Link>
        ))}
      </nav>
      <div className="catalog-count"><span>{products.length} منتجات</span>{q && <span>نتائج البحث عن «{q}»</span>}</div>
      {products.length > 0 ? (
        <div className="product-grid catalog-grid">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <div className="empty-state catalog-empty">
          <span className="empty-icon">⌕</span>
          <h2>لا توجد نتائج مطابقة.</h2>
          <p>جرّب كلمة أخرى أو تصفح كامل التشكيلة.</p>
          <Link className="button button-dark" href="/products">عرض كل المنتجات</Link>
        </div>
      )}
    </div>
  );
}
