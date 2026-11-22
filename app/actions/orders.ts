"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { actionError } from "@/lib/action-result";
import type { ActionResult } from "@/lib/action-result";
import { checkRateLimit, requestIp } from "@/lib/rate-limit";
import { PublicActionError, runAction, zodMessage } from "@/lib/server-action";
import { checkoutSchema } from "@/lib/validation";

type CreatedOrder = {
  id: string;
  orderNumber: string;
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
};

export async function createOrder(
  input: unknown,
): Promise<ActionResult<CreatedOrder>> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) return actionError(zodMessage(parsed.error));
  if (parsed.data.website) {
    return actionError("تعذر إتمام الطلب. يرجى المحاولة لاحقاً.");
  }

  const requestHeaders = await headers();
  const ip = requestIp(requestHeaders);
  if (!checkRateLimit(`checkout:${ip}`, 5, 15 * 60 * 1000)) {
    return actionError("تم تجاوز عدد محاولات الطلب. يرجى الانتظار قليلاً.");
  }

  const result = await runAction("createOrder", async () => {
    const data = parsed.data;

    return db().$transaction(
      async (tx) => {
        const [variants, wilaya] = await Promise.all([
          tx.variant.findMany({
            where: { id: { in: data.items.map((item) => item.variantId) } },
            select: {
              id: true,
              size: true,
              color: true,
              stock: true,
              isActive: true,
              product: {
                select: {
                  name: true,
                  price: true,
                  discountPrice: true,
                  isActive: true,
                },
              },
            },
          }),
          tx.wilaya.findFirst({
            where: { code: data.wilayaCode.padStart(2, "0"), isActive: true },
            select: { code: true, homePrice: true, deskPrice: true },
          }),
        ]);

        if (!wilaya) {
          throw new PublicActionError("الولاية المختارة غير متاحة حالياً.");
        }

        const variantById = new Map(variants.map((variant) => [variant.id, variant]));
        const items = data.items.map((item) => {
          const variant = variantById.get(item.variantId);
          if (
            !variant ||
            !variant.isActive ||
            !variant.product.isActive ||
            variant.stock < item.quantity
          ) {
            throw new PublicActionError(
              "عذراً، أحد المنتجات أو المقاسات المختارة غير متوفر بالكمية المطلوبة.",
            );
          }

          const unitPrice = variant.product.discountPrice ?? variant.product.price;
          return {
            variantId: variant.id,
            productName: variant.product.name,
            size: variant.size,
            color: variant.color,
            quantity: item.quantity,
            unitPrice,
            lineTotal: unitPrice * item.quantity,
          };
        });

        const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
        const shippingCost =
          data.deliveryType === "HOME" ? wilaya.homePrice : wilaya.deskPrice;
        const totalAmount = subtotal + shippingCost;
        const orderNumber = `MS-${new Date().toISOString().slice(2, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;

        const order = await tx.order.create({
          data: {
            orderNumber,
            customerName: data.customerName,
            phone: data.phone,
            email: data.email || null,
            address: data.address,
            customerNote: data.customerNote || null,
            wilayaCode: wilaya.code,
            deliveryType: data.deliveryType,
            subtotal,
            shippingCost,
            totalAmount,
            items: { create: items },
          },
          select: {
            id: true,
            orderNumber: true,
            subtotal: true,
            shippingCost: true,
            totalAmount: true,
          },
        });

        return order;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  });
  if (result.success) {
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
  }
  return result;
}

