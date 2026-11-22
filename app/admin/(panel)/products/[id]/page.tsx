import { notFound } from "next/navigation";
import { AdminProductEditor } from "@/components/admin/admin-product-editor";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { db } from "@/lib/db";
import { requireAdminPage } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

type ProductEditProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: ProductEditProps) {
  await requireAdminPage();
  const { id } = await params;
  const [product, categories] = await Promise.all([
    db().product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        discountPrice: true,
        categoryId: true,
        isActive: true,
        isFeatured: true,
        images: { orderBy: { position: "asc" }, select: { id: true, url: true, alt: true } },
        variants: {
          orderBy: [{ size: "asc" }, { color: "asc" }],
          select: { id: true, size: true, color: true, stock: true, isActive: true },
        },
      },
    }),
    db().category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <>
      <div className="admin-page-heading">
        <div><span className="admin-eyebrow">إدارة الكتالوج</span><h1>تعديل المنتج</h1></div>
        <DeleteProductButton productId={product.id} />
      </div>
      <AdminProductEditor categories={categories} product={product} />
    </>
  );
}
