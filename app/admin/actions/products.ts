"use server";

import { revalidatePath } from "next/cache";
import { actionError } from "@/lib/action-result";
import type { ActionResult } from "@/lib/action-result";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { PublicActionError, runAction, zodMessage } from "@/lib/server-action";
import {
  productIdSchema,
  productInputSchema,
} from "@/lib/validation";

export async function saveProduct(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = productInputSchema.safeParse(input);
  if (!parsed.success) return actionError(zodMessage(parsed.error));

  return runAction("saveProduct", async () => {
    await requireAdmin();
    const data = parsed.data;
    const { id, images, variants, ...productData } = data;
    const savedId = await db().$transaction(async (tx) => {
      if (id) {
        const existing = await tx.product.findUnique({
          where: { id },
          select: { id: true, variants: { select: { id: true } } },
        });
        if (!existing) throw new PublicActionError("المنتج غير موجود.");

        const existingVariantIds = new Set(existing.variants.map((variant) => variant.id));
        if (variants.some((variant) => variant.id && !existingVariantIds.has(variant.id))) {
          throw new PublicActionError("توجد بيانات مقاس غير صالحة.");
        }

        const removedVariantIds = existing.variants
          .map((variant) => variant.id)
          .filter((variantId) => !variants.some((variant) => variant.id === variantId));
        if (removedVariantIds.length > 0) {
          const usedCount = await tx.orderItem.count({
            where: { variantId: { in: removedVariantIds } },
          });
          if (usedCount > 0) {
            throw new PublicActionError(
              "لا يمكن حذف مقاس مرتبط بطلبات سابقة. أوقف توفره أو عطّل المنتج بدلاً من ذلك.",
            );
          }
          await tx.variant.deleteMany({
            where: { id: { in: removedVariantIds }, productId: id },
          });
        }

        for (const variant of variants) {
          if (variant.id) {
            await tx.variant.update({
              where: { id: variant.id },
              data: {
                size: variant.size,
                color: variant.color,
                stock: variant.stock,
                isActive: variant.isActive,
              },
            });
          } else {
            await tx.variant.create({
              data: {
                productId: id,
                size: variant.size,
                color: variant.color,
                stock: variant.stock,
                isActive: variant.isActive,
              },
            });
          }
        }

        await tx.product.update({ where: { id }, data: productData });
        await tx.productImage.deleteMany({ where: { productId: id } });
        await tx.productImage.createMany({
          data: images.map((image, position) => ({ ...image, productId: id, position })),
        });
        return id;
      }

      const product = await tx.product.create({
        data: {
          ...productData,
          images: {
            create: images.map((image, position) => ({ ...image, position })),
          },
          variants: {
            create: variants.map(({ size, color, stock, isActive }) => ({
              size,
              color,
              stock,
              isActive,
            })),
          },
        },
        select: { id: true },
      });
      return product.id;
    });

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin");
    revalidatePath("/admin/products");
    revalidatePath(`/products/${data.slug}`);
    return { id: savedId };
  });
}

export async function deleteProduct(input: unknown): Promise<ActionResult<null>> {
  const parsed = productIdSchema.safeParse(input);
  if (!parsed.success) return actionError(zodMessage(parsed.error));

  return runAction("deleteProduct", async () => {
    await requireAdmin();
    const product = await db().product.findUnique({
      where: { id: parsed.data.id },
      select: { id: true, variants: { select: { id: true } } },
    });
    if (!product) throw new PublicActionError("المنتج غير موجود.");

    const linkedItems = await db().orderItem.count({
      where: { variantId: { in: product.variants.map((variant) => variant.id) } },
    });
    if (linkedItems > 0) {
      throw new PublicActionError(
        "لا يمكن حذف منتج مرتبط بطلبات سابقة. أوقف توفره أو عطّله بدلاً من ذلك.",
      );
    }

    await db().product.delete({ where: { id: product.id } });
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin");
    revalidatePath("/admin/products");
    return null;
  });
}
