import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { wilayaSeedData } from "../lib/wilayas";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not configured.");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const categories = [
  { name: "ملابس", slug: "clothing" },
  { name: "أحذية", slug: "shoes" },
  { name: "إكسسوارات", slug: "accessories" },
];

const productSeeds = [
  {
    name: "قميص أكسفورد كلاسيكي",
    slug: "classic-oxford-shirt",
    category: "clothing",
    price: 5200,
    discountPrice: 4500,
    isFeatured: true,
    description: "قميص أكسفورد قطني بقصة مريحة وتفاصيل أنيقة للاستخدام اليومي.",
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=1200&q=85",
    colors: ["أبيض", "أزرق"],
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    name: "تيشيرت قطني أساسي",
    slug: "essential-cotton-tee",
    category: "clothing",
    price: 2400,
    isFeatured: true,
    description: "تيشيرت قطني ناعم بخامة متينة وقصة مستقيمة.",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=85",
    colors: ["أسود", "أبيض", "زيتي"],
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    name: "سويت شيرت يومي",
    slug: "everyday-sweatshirt",
    category: "clothing",
    price: 5900,
    isFeatured: false,
    description: "سويت شيرت دافئ بملمس ناعم وتصميم بسيط.",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=85",
    colors: ["رمادي", "كحلي"],
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    name: "بنطال تشينو",
    slug: "classic-chino-pants",
    category: "clothing",
    price: 6400,
    discountPrice: 5700,
    isFeatured: true,
    description: "بنطال تشينو مرن يجمع بين الراحة والمظهر المرتب.",
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1200&q=85",
    colors: ["بيج", "كحلي"],
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    name: "جاكيت خفيف",
    slug: "lightweight-jacket",
    category: "clothing",
    price: 9800,
    isFeatured: false,
    description: "جاكيت خفيف متعدد الاستخدامات بجيوب عملية.",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=85",
    colors: ["أسود", "بني"],
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    name: "حذاء رياضي يومي",
    slug: "daily-runner-sneaker",
    category: "shoes",
    price: 8900,
    discountPrice: 7900,
    isFeatured: true,
    description: "حذاء خفيف بنعل مريح للمشي والاستخدام اليومي.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=85",
    colors: ["أبيض", "أسود"],
    sizes: ["39", "40", "41", "42", "43", "44", "45"],
  },
  {
    name: "حذاء جلدي رسمي",
    slug: "leather-formal-shoe",
    category: "shoes",
    price: 12500,
    isFeatured: false,
    description: "حذاء جلدي أنيق للمناسبات والعمل.",
    image: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=1200&q=85",
    colors: ["أسود", "بني"],
    sizes: ["39", "40", "41", "42", "43", "44", "45"],
  },
  {
    name: "حذاء قماش كلاسيكي",
    slug: "canvas-classic-shoe",
    category: "shoes",
    price: 6200,
    isFeatured: false,
    description: "حذاء قماش مريح بتصميم كلاسيكي سهل التنسيق.",
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=85",
    colors: ["أبيض", "كحلي"],
    sizes: ["39", "40", "41", "42", "43", "44", "45"],
  },
  {
    name: "حذاء مشي مريح",
    slug: "comfort-walking-shoe",
    category: "shoes",
    price: 9700,
    isFeatured: true,
    description: "دعم وراحة طوال اليوم مع تصميم رياضي بسيط.",
    image: "https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3?auto=format&fit=crop&w=1200&q=85",
    colors: ["رمادي", "أسود"],
    sizes: ["39", "40", "41", "42", "43", "44", "45"],
  },
  {
    name: "حزام جلد طبيعي",
    slug: "leather-belt",
    category: "accessories",
    price: 3200,
    isFeatured: false,
    description: "حزام جلدي متين بإبزيم معدني كلاسيكي.",
    image: "https://images.unsplash.com/photo-1624222247344-550fb8a8b7f1?auto=format&fit=crop&w=1200&q=85",
    colors: ["أسود", "بني"],
    sizes: ["M", "L", "XL"],
  },
  {
    name: "محفظة جلدية",
    slug: "leather-wallet",
    category: "accessories",
    price: 3900,
    isFeatured: true,
    description: "محفظة عملية بتصميم نحيف ومساحات منظمة للبطاقات.",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1200&q=85",
    colors: ["أسود", "بني"],
    sizes: ["واحد"],
  },
  {
    name: "قبعة قطنية",
    slug: "cotton-cap",
    category: "accessories",
    price: 2100,
    isFeatured: false,
    description: "قبعة قطنية قابلة للتعديل بتصميم يومي.",
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1200&q=85",
    colors: ["أسود", "كحلي", "بيج"],
    sizes: ["واحد"],
  },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
  }

  for (const product of productSeeds) {
    const category = await prisma.category.findUniqueOrThrow({
      where: { slug: product.category },
    });
    const saved = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice ?? null,
        isActive: true,
        isFeatured: product.isFeatured,
        categoryId: category.id,
      },
    });

    const imageCount = await prisma.productImage.count({ where: { productId: saved.id } });
    if (imageCount === 0) {
      await prisma.productImage.create({
        data: {
          productId: saved.id,
          url: product.image,
          alt: product.name,
          position: 0,
        },
      });
    }

    for (const size of product.sizes) {
      for (const color of product.colors) {
        await prisma.variant.upsert({
          where: {
            productId_size_color: { productId: saved.id, size, color },
          },
          update: {},
          create: {
            productId: saved.id,
            size,
            color,
            stock: size === "واحد" ? 15 : 8,
            isActive: true,
          },
        });
      }
    }
  }

  for (const [code, nameAr, nameFr, homePrice, deskPrice] of wilayaSeedData) {
    await prisma.wilaya.upsert({
      where: { code },
      update: { nameAr, nameFr },
      create: { code, nameAr, nameFr, homePrice, deskPrice, isActive: true },
    });
  }

  console.info(
    `Seeded ${categories.length} categories, ${productSeeds.length} products, and ${wilayaSeedData.length} wilayas.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error("Database seed failed.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
