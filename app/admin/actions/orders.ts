"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { actionError } from "@/lib/action-result";
import type { ActionResult } from "@/lib/action-result";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { canTransitionOrder } from "@/lib/order-state";
import { PublicActionError, runAction, zodMessage } from "@/lib/server-action";
import {
  internalNoteSchema,
  orderStatusSchema,
} from "@/lib/validation";

export async function changeOrderStatus(input: unknown): Promise<ActionResult<null>> {
  const parsed = orderStatusSchema.safeParse(input);
  if (!parsed.success) return actionError(zodMessage(parsed.error));

  return runAction("changeOrderStatus", async () => {
    await requireAdmin();
    const { orderId, status: nextStatus } = parsed.data;

    await db().$transaction(
      async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
          select: {
            id: true,
            status: true,
            stockDeducted: true,
            items: { select: { variantId: true, quantity: true } },
          },
        });
        if (!order) throw new PublicActionError("الطلب غير موجود.");
        if (!canTransitionOrder(order.status, nextStatus)) {
          throw new PublicActionError("تغيير حالة الطلب غير مسموح.");
        }

        if (nextStatus === "CONFIRMED") {
          if (order.stockDeducted) {
            throw new PublicActionError("تم خصم مخزون هذا الطلب مسبقاً.");
          }
          for (const item of order.items) {
            const result = await tx.variant.updateMany({
              where: { id: item.variantId, stock: { gte: item.quantity } },
              data: { stock: { decrement: item.quantity } },
            });
            if (result.count !== 1) {
              throw new PublicActionError(
                "تعذر تأكيد الطلب: لم تعد الكمية المطلوبة متوفرة في المخزون.",
              );
            }
          }
        }

        const restoringStock =
          nextStatus === "CANCELLED" &&
          (order.status === "CONFIRMED" || order.status === "SHIPPED") &&
          order.stockDeducted;
        const updated = await tx.order.updateMany({
          where: {
            id: order.id,
            status: order.status,
            stockDeducted: order.stockDeducted,
          },
          data: {
            status: nextStatus,
            ...(nextStatus === "CONFIRMED" ? { stockDeducted: true } : {}),
            ...(nextStatus === "CANCELLED" && order.stockDeducted
              ? { stockDeducted: false }
              : {}),
          },
        });
        if (updated.count !== 1) {
          throw new PublicActionError("تم تحديث الطلب بواسطة مستخدم آخر. حدّث الصفحة وحاول مجدداً.");
        }

        if (restoringStock) {
          for (const item of order.items) {
            await tx.variant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/products");
    revalidatePath("/");
    return null;
  });
}

export async function saveInternalNote(input: unknown): Promise<ActionResult<null>> {
  const parsed = internalNoteSchema.safeParse(input);
  if (!parsed.success) return actionError(zodMessage(parsed.error));

  return runAction("saveInternalNote", async () => {
    await requireAdmin();
    const updated = await db().order.updateMany({
      where: { id: parsed.data.orderId },
      data: { internalNote: parsed.data.internalNote || null },
    });
    if (updated.count !== 1) throw new PublicActionError("الطلب غير موجود.");
    revalidatePath(`/admin/orders/${parsed.data.orderId}`);
    revalidatePath("/admin/orders");
    return null;
  });
}
