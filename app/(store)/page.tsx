import Link from "next/link";
import { ArrowLeft, ArrowUpLeft } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, categories, totalProducts] = await Promise.all([
    db().product.findMany({
      where: { isActive: true, isFeatured: true },
      include: {
        category: { select: { name: true, slug: true } },
        images: { orderBy: { position: "asc" }, take: 1, select: { url: true, alt: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    db().category.findMany({
      where: { products: { some: { isActive: true } } },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    db().product.count({ where: { isActive: true } }),
  ]);

  return (
    <>
      <section className="hero">
        <div className="shell hero-content">
          <div className="hero-copy">
            <span className="hero-kicker"><span /> أسلوبٌ يبقى</span>
            <h1>الأناقة ليست<br /><em>في كثرة الاختيار.</em></h1>
            <p>قطع يومية مختارة بعناية، بجودة تعيش معك وتفاصيل تشبهك.</p>
            <div className="hero-actions">
              <Link className="button button-light" href="/products">اكتشف المجموعة <ArrowLeft size={17} /></Link>
              <span className="hero-caption">ملابس · أحذية · أساسيات</span>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="hero-arch">
              <div className="hero-sun" />
              <div className="hero-silhouette" />
              <div className="hero-cloth" />
            </div>
            <span className="hero-art-label">COLLECTION Nº 01</span>
            <span className="hero-vertical-label">MADE FOR EVERYDAY</span>
          </div>
          <div className="hero-index"><span>01</span><i /> 03</div>
        </div>
      </section>

      <section className="category-strip shell" aria-label="تسوق حسب الفئة">
        <div className="section-intro compact-intro">
          <span className="eyebrow">صنّف اختياراتك</span>
          <h2>ما الذي تبحث عنه؟</h2>
        </div>
        <div className="category-links">
          {categories.map((category, index) => (
            <Link href={`/products?category=${category.slug}`} className="category-tile" key={category.id}>
              <span className="category-number">0{index + 1}</span>
              <span>{category.name}</span>
              <ArrowUpLeft size={18} />
            </Link>
          ))}
          <Link href="/products" className="category-tile category-all">
            <span className="category-number">{String(totalProducts).padStart(2, "0")}</span>
            <span>جميع المنتجات</span>
            <ArrowUpLeft size={18} />
          </Link>
        </div>
      </section>

      <section className="featured-section">
        <div className="shell">
          <div className="section-heading">
            <div className="section-intro">
              <span className="eyebrow">اختيارات مِداد</span>
              <h2>قطع تستحق مكانها.</h2>
              <p>أساسيات منتقاة بعناية لترافقك كل يوم.</p>
            </div>
            <Link className="text-link arrow-link" href="/products">اكتشف المجموعة <ArrowLeft size={16} /></Link>
          </div>
          {products.length > 0 ? (
            <div className="product-grid">
              {products.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <div className="empty-catalog">
              <p>نجهز لك تشكيلتنا الجديدة.</p>
              <Link className="text-link" href="/products">تصفح المنتجات</Link>
            </div>
          )}
        </div>
      </section>

      <section className="promise-section shell">
        <div className="promise-copy">
          <span className="eyebrow">تفاصيل تهمك</span>
          <h2>طلبك يصل إليك،<br /><em>حيثما كنت.</em></h2>
          <p>نوصّل إلى جميع ولايات الجزائر، مع خيارات توصيل إلى المنزل أو الاستلام من المكتب، والدفع عند الاستلام.</p>
          <Link className="text-link arrow-link" href="/products">ابدأ التسوق <ArrowLeft size={16} /></Link>
        </div>
        <div className="promise-map" aria-hidden="true">
          <span className="map-ring ring-one" /><span className="map-ring ring-two" />
          <span className="map-center">58</span>
          <span className="map-caption">ولاية · باب بيتك</span>
        </div>
      </section>
    </>
  );
}
