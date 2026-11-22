"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { formatDzd } from "@/lib/format";
import { isImageOptimizerAllowed } from "@/lib/image";
import { useCartStore } from "@/store/cart-store";

type ProductDetailProps = {
  product: {
    name: string;
    slug: string;
    description: string;
    price: number;
    discountPrice: number | null;
    category: { name: string; slug: string };
    images: { id: string; url: string; alt: string }[];
    variants: { id: string; size: string; color: string; stock: number }[];
  };
};

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);

  const sizes = useMemo(
    () => [...new Set(product.variants.map((variant) => variant.size))],
    [product.variants],
  );
  const colors = useMemo(
    () => [...new Set(product.variants.map((variant) => variant.color))],
    [product.variants],
  );
  const currentVariant = product.variants.find(
    (variant) => variant.size === selectedSize && variant.color === selectedColor,
  );
  const availableColors = selectedSize
    ? new Set(
        product.variants
          .filter((variant) => variant.size === selectedSize && variant.stock > 0)
          .map((variant) => variant.color),
      )
    : new Set(colors);
  const availableSizes = selectedColor
    ? new Set(
        product.variants
          .filter((variant) => variant.color === selectedColor && variant.stock > 0)
          .map((variant) => variant.size),
      )
    : new Set(sizes);
  const firstImage = product.images[0];

  function addToCart() {
    if (!currentVariant || currentVariant.stock < 1) {
      toast.error("اختر المقاس واللون المتوفرين أولاً.");
      return;
    }
    if (
      cartItems.length >= 20 &&
      !cartItems.some((item) => item.variantId === currentVariant.id)
    ) {
      toast.error("يمكن إضافة 20 منتجاً مختلفاً كحد أقصى.");
      return;
    }

    for (let index = 0; index < quantity; index += 1) {
      const addedToCart = addItem({
        variantId: currentVariant.id,
        productName: product.name,
        slug: product.slug,
        image: firstImage?.url ?? "",
        size: currentVariant.size,
        color: currentVariant.color,
        unitPrice: product.discountPrice ?? product.price,
      });
      if (!addedToCart) {
        toast.error("يمكن إضافة 20 منتجاً مختلفاً كحد أقصى.");
        return;
      }
    }
    setAdded(true);
    toast.success("أُضيف المنتج إلى سلتك.");
  }

  return (
    <div className="shell product-detail">
      <div className="product-detail-image">
        {firstImage ? (
          <Image
            src={firstImage.url}
            alt={firstImage.alt}
            fill
            priority
            unoptimized={!isImageOptimizerAllowed(firstImage.url)}
            sizes="(max-width: 760px) 100vw, 55vw"
          />
        ) : <span className="image-placeholder">مِداد</span>}
        {product.discountPrice && <span className="sale-tag">عرض خاص</span>}
      </div>
      <div className="product-detail-copy">
        <div className="breadcrumbs">
          <Link href="/">الرئيسية</Link><span>/</span>
          <Link href={`/products?category=${product.category.slug}`}>{product.category.name}</Link>
        </div>
        <span className="eyebrow">اختيار مِداد</span>
        <h1>{product.name}</h1>
        <div className="detail-price">
          <strong>{formatDzd(product.discountPrice ?? product.price)}</strong>
          {product.discountPrice && <del>{formatDzd(product.price)}</del>}
        </div>
        <p className="product-description">{product.description}</p>

        {sizes.length > 0 && (
          <fieldset className="option-fieldset">
            <legend>المقاس <span>{selectedSize}</span></legend>
            <div className="option-list">
              {sizes.map((size) => (
                <button
                  className={`size-option ${selectedSize === size ? "selected" : ""}`}
                  type="button"
                  key={size}
                  disabled={!availableSizes.has(size)}
                  aria-pressed={selectedSize === size}
                  onClick={() => { setSelectedSize(size); setAdded(false); }}
                >
                  {size}
                </button>
              ))}
            </div>
          </fieldset>
        )}
        {colors.length > 0 && (
          <fieldset className="option-fieldset">
            <legend>اللون <span>{selectedColor}</span></legend>
            <div className="option-list">
              {colors.map((color) => (
                <button
                  className={`color-option ${selectedColor === color ? "selected" : ""}`}
                  type="button"
                  key={color}
                  disabled={!availableColors.has(color)}
                  aria-pressed={selectedColor === color}
                  onClick={() => { setSelectedColor(color); setAdded(false); }}
                >
                  {color}
                </button>
              ))}
            </div>
          </fieldset>
        )}
        {currentVariant && (
          <p className={`stock-hint ${currentVariant.stock < 4 ? "low-stock" : ""}`}>
            {currentVariant.stock > 0 ? `متوفر · ${currentVariant.stock} قطع` : "نفد هذا الاختيار"}
          </p>
        )}
        <div className="add-to-cart-row">
          <div className="quantity-control" aria-label="الكمية">
            <button type="button" aria-label="تقليل الكمية" onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={15} /></button>
            <span aria-live="polite">{quantity}</span>
            <button type="button" aria-label="زيادة الكمية" onClick={() => setQuantity((value) => Math.min(10, value + 1))}><Plus size={15} /></button>
          </div>
          <button
            type="button"
            className="button button-dark add-to-cart"
            disabled={!currentVariant || currentVariant.stock < 1}
            onClick={addToCart}
          >
            {added ? <><Check size={18} /> أُضيف للسلة</> : <><ShoppingBag size={18} /> أضف إلى السلة</>}
          </button>
        </div>
        <p className="detail-footnote">شحن إلى ولايتك · الدفع عند الاستلام</p>
        <Link className="text-link" href="/cart">عرض سلة المشتريات</Link>
      </div>
    </div>
  );
}
