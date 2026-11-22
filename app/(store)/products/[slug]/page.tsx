import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product-detail";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await db().product.findFirst({
    where: { slug, isActive: true },
    select: { name: true, description: true },
  });
  return product
    ? { title: product.name, description: product.description.slice(0, 160) }
    : { title: "المنتج غير موجود" };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await db().product.findFirst({
    where: { slug, isActive: true },
    include: {
      category: { select: { name: true, slug: true } },
      images: { orderBy: { position: "asc" }, select: { id: true, url: true, alt: true } },
      variants: {
        where: { isActive: true },
        orderBy: [{ size: "asc" }, { color: "asc" }],
        select: { id: true, size: true, color: true, stock: true },
      },
    },
  });
  if (!product) notFound();

  return (
    <div className="product-detail-page">
      <ProductDetail product={product} />
      <section className="shell product-trust-row">
        <div><span>01</span><strong>اختيار بعناية</strong><small>خامات وتفاصيل عملية</small></div>
        <div><span>02</span><strong>توصيل موثوق</strong><small>إلى 58 ولاية</small></div>
        <div><span>03</span><strong>دفع عند الاستلام</strong><small>اطلب بثقة وراحة</small></div>
      </section>
    </div>
  );
}
