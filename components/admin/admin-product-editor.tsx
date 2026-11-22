"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { saveProduct } from "@/app/admin/actions/products";

type CategoryOption = { id: string; name: string };
type ProductDraft = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice: number | null;
  categoryId: string;
  isActive: boolean;
  isFeatured: boolean;
  images: { id?: string; url: string; alt: string; position?: number }[];
  variants: { id?: string; size: string; color: string; stock: number; isActive: boolean }[];
};

const emptyImage = { url: "", alt: "" };
const emptyVariant = { size: "", color: "", stock: 0, isActive: true };

export function AdminProductEditor({
  categories,
  product,
}: {
  categories: CategoryOption[];
  product?: ProductDraft;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [images, setImages] = useState<
    { id?: string; url: string; alt: string; position?: number }[]
  >(product?.images ?? [emptyImage]);
  const [variants, setVariants] = useState<
    { id?: string; size: string; color: string; stock: number; isActive: boolean }[]
  >(product?.variants ?? [emptyVariant]);

  function moveImage(index: number, direction: -1 | 1) {
    const destination = index + direction;
    if (destination < 0 || destination >= images.length) return;
    setImages((current) => {
      const updated = [...current];
      [updated[index], updated[destination]] = [updated[destination], updated[index]];
      return updated;
    });
  }

  function submit(formData: FormData) {
    const payload = {
      ...(product ? { id: product.id } : {}),
      name: String(formData.get("name") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      description: String(formData.get("description") ?? ""),
      price: Number(formData.get("price")),
      discountPrice: String(formData.get("discountPrice") ?? "").trim()
        ? Number(formData.get("discountPrice"))
        : null,
      categoryId: String(formData.get("categoryId") ?? ""),
      isActive: formData.has("isActive"),
      isFeatured: formData.has("isFeatured"),
      images: images.map(({ url, alt }) => ({ url, alt })),
      variants,
    };

    startTransition(async () => {
      const result = await saveProduct(payload);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(product ? "تم تحديث المنتج." : "تم إنشاء المنتج.");
      router.replace(`/admin/products/${result.data.id}`);
      router.refresh();
    });
  }

  return (
    <form action={submit} className="admin-form">
      <section className="admin-card admin-subsection">
        <div className="admin-subsection-heading"><h2>معلومات المنتج</h2></div>
        <div className="admin-form-grid">
          <label className="admin-field">اسم المنتج
            <input name="name" defaultValue={product?.name} required minLength={2} maxLength={120} />
          </label>
          <label className="admin-field">الرابط المختصر (slug)
            <input name="slug" defaultValue={product?.slug} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" maxLength={140} dir="ltr" />
          </label>
          <label className="admin-field">الفئة
            <select name="categoryId" defaultValue={product?.categoryId ?? categories[0]?.id} required>
              {categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}
            </select>
          </label>
          <label className="admin-field">السعر (دج)
            <input name="price" type="number" min="1" max="10000000" defaultValue={product?.price} required />
          </label>
          <label className="admin-field">سعر التخفيض (اختياري)
            <input name="discountPrice" type="number" min="1" max="10000000" defaultValue={product?.discountPrice ?? ""} />
          </label>
          <label className="admin-field wide">الوصف
            <textarea name="description" defaultValue={product?.description} required minLength={5} maxLength={5000} />
          </label>
        </div>
        <div className="admin-switch-row">
          <label className="admin-checkbox">
            <input type="checkbox" name="isActive" defaultChecked={product?.isActive ?? true} /> المنتج متاح
          </label>
          <label className="admin-checkbox">
            <input type="checkbox" name="isFeatured" defaultChecked={product?.isFeatured ?? false} /> منتج مميز
          </label>
        </div>
      </section>

      <section className="admin-card admin-subsection">
        <div className="admin-subsection-heading">
          <h2>صور المنتج</h2>
          <button className="admin-button secondary" type="button" onClick={() => setImages((current) => [...current, { ...emptyImage }])}>
            <Plus size={14} /> إضافة صورة
          </button>
        </div>
        {images.map((image, index) => (
          <div className="admin-image-row" key={image.id ?? `image-${index}`}>
            <label className="admin-field">رابط الصورة
              <input
                type="url"
                value={image.url}
                onChange={(event) => setImages((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, url: event.target.value } : entry))}
                required
                dir="ltr"
              />
            </label>
            <label className="admin-field">وصف الصورة
              <input
                value={image.alt}
                onChange={(event) => setImages((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, alt: event.target.value } : entry))}
                required
                maxLength={160}
              />
            </label>
            <div className="admin-row-actions" aria-label={`ترتيب الصورة ${index + 1}`}>
              <button type="button" aria-label="تحريك الصورة للأعلى" onClick={() => moveImage(index, -1)} disabled={index === 0}><ArrowUp size={14} /></button>
              <button type="button" aria-label="تحريك الصورة للأسفل" onClick={() => moveImage(index, 1)} disabled={index === images.length - 1}><ArrowDown size={14} /></button>
              <button type="button" aria-label="إزالة الصورة" onClick={() => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))} disabled={images.length === 1}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </section>

      <section className="admin-card admin-subsection">
        <div className="admin-subsection-heading">
          <h2>المقاسات والألوان والمخزون</h2>
          <button className="admin-button secondary" type="button" onClick={() => setVariants((current) => [...current, { ...emptyVariant }])}>
            <Plus size={14} /> إضافة خيار
          </button>
        </div>
        {variants.map((variant, index) => (
          <div className="admin-variant-row" key={variant.id ?? `variant-${index}`}>
            <label className="admin-field">المقاس
              <input
                value={variant.size}
                onChange={(event) => setVariants((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, size: event.target.value } : entry))}
                required maxLength={20}
              />
            </label>
            <label className="admin-field">اللون
              <input
                value={variant.color}
                onChange={(event) => setVariants((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, color: event.target.value } : entry))}
                required maxLength={40}
              />
            </label>
            <label className="admin-field">المخزون
              <input
                type="number" min="0" max="100000" required value={variant.stock}
                onChange={(event) => setVariants((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, stock: Number(event.target.value) } : entry))}
              />
            </label>
            <div className="admin-row-actions">
              <button type="button" aria-label="حذف المقاس" onClick={() => setVariants((current) => current.filter((_, itemIndex) => itemIndex !== index))} disabled={variants.length === 1}><Trash2 size={14} /></button>
            </div>
            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={variant.isActive}
                onChange={(event) => setVariants((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, isActive: event.target.checked } : entry))}
              /> متاح للبيع
            </label>
          </div>
        ))}
      </section>

      <div className="admin-toolbar">
        <button className="admin-button" type="submit" disabled={pending}>
          {pending ? "جارٍ الحفظ..." : product ? "حفظ التعديلات" : "إنشاء المنتج"}
        </button>
        {product && <a className="admin-button secondary admin-button-link" href={`/products/${product.slug}`} target="_blank" rel="noreferrer">معاينة المنتج</a>}
      </div>
    </form>
  );
}
