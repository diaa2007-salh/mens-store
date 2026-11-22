import { z } from "zod";

const customerPhone = z
  .string()
  .trim()
  .min(8, "رقم الهاتف غير صالح.")
  .max(24, "رقم الهاتف غير صالح.")
  .regex(/^[+0-9][0-9\s()-]+$/, "رقم الهاتف غير صالح.");

export const checkoutSchema = z
  .object({
    items: z
      .array(
        z
          .object({
            variantId: z.string().min(1).max(64),
            quantity: z.number().int().min(1).max(10),
          })
          .strict(),
      )
      .min(1, "السلة فارغة.")
      .max(20, "يمكن إضافة 20 منتجاً مختلفاً كحد أقصى.")
      .refine(
        (items) => new Set(items.map((item) => item.variantId)).size === items.length,
        "يوجد منتج مكرر في السلة.",
      ),
    customerName: z.string().trim().min(2).max(100),
    phone: customerPhone,
    email: z.union([z.string().trim().email().max(254), z.literal("")]).optional(),
    address: z.string().trim().min(5).max(240),
    customerNote: z.string().trim().max(500).optional(),
    wilayaCode: z.string().regex(/^\d{1,2}$/),
    deliveryType: z.enum(["HOME", "DESK"]),
    website: z.string().max(0).optional(),
  })
  .strict();

export const adminLoginSchema = z
  .object({
    email: z.string().trim().email().max(254),
    password: z.string().min(1).max(200),
  })
  .strict();

const variantSchema = z
  .object({
    id: z.string().min(1).max(64).optional(),
    size: z.string().trim().min(1).max(20),
    color: z.string().trim().min(1).max(40),
    stock: z.number().int().min(0).max(100_000),
    isActive: z.boolean().default(true),
  })
  .strict();

export const productInputSchema = z
  .object({
    id: z.string().min(1).max(64).optional(),
    name: z.string().trim().min(2).max(120),
    slug: z
      .string()
      .trim()
      .min(2)
      .max(140)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    description: z.string().trim().min(5).max(5000),
    price: z.number().int().positive().max(10_000_000),
    discountPrice: z.number().int().positive().max(10_000_000).nullable(),
    categoryId: z.string().min(1).max(64),
    isActive: z.boolean(),
    isFeatured: z.boolean(),
    images: z
      .array(
        z
          .object({
            url: z.string().url().max(2000).refine((value) => value.startsWith("https://")),
            alt: z.string().trim().min(1).max(160),
          })
          .strict(),
      )
      .min(1)
      .max(12),
    variants: z.array(variantSchema).min(1).max(100),
  })
  .strict()
  .refine(
    (product) =>
      product.discountPrice === null || product.discountPrice < product.price,
    "سعر التخفيض يجب أن يكون أقل من السعر الأصلي.",
  )
  .refine(
    (product) => {
      const keys = product.variants.map(
        (variant) => `${variant.size.toLocaleLowerCase()}::${variant.color.toLocaleLowerCase()}`,
      );
      return new Set(keys).size === keys.length;
    },
    "يجب ألا تتكرر تركيبة المقاس واللون.",
  );

export const productIdSchema = z.object({ id: z.string().min(1).max(64) }).strict();

export const orderStatusSchema = z
  .object({
    orderId: z.string().min(1).max(64),
    status: z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]),
  })
  .strict();

export const internalNoteSchema = z
  .object({
    orderId: z.string().min(1).max(64),
    internalNote: z.string().trim().max(2000),
  })
  .strict();

export const shippingRateSchema = z
  .object({
    code: z.string().regex(/^\d{1,2}$/),
    homePrice: z.number().int().min(0).max(100_000),
    deskPrice: z.number().int().min(0).max(100_000),
    isActive: z.boolean(),
  })
  .strict();

export const emptyInputSchema = z.object({}).strict();
