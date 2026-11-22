import Image from "next/image";
import Link from "next/link";
import { ArrowUpLeft } from "lucide-react";
import { formatDzd } from "@/lib/format";
import { isImageOptimizerAllowed } from "@/lib/image";

export type StoreProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  isFeatured?: boolean;
  category: { name: string; slug: string };
  images: { url: string; alt: string }[];
};

export function ProductCard({ product }: { product: StoreProduct }) {
  const image = product.images[0];
  return (
    <article className="product-card">
      <Link className="product-card-image" href={`/products/${product.slug}`}>
        {image ? (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            unoptimized={!isImageOptimizerAllowed(image.url)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <span className="image-placeholder">مِداد</span>
        )}
        {product.discountPrice && <span className="sale-tag">عرض خاص</span>}
        <span className="product-card-arrow" aria-hidden="true"><ArrowUpLeft size={17} /></span>
      </Link>
      <div className="product-card-info">
        <span className="eyebrow">{product.category.name}</span>
        <Link href={`/products/${product.slug}`} className="product-card-name">{product.name}</Link>
        <div className="price-line">
          <strong>{formatDzd(product.discountPrice ?? product.price)}</strong>
          {product.discountPrice && <del>{formatDzd(product.price)}</del>}
        </div>
      </div>
    </article>
  );
}
