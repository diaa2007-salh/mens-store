"use server";

import { revalidatePath } from "next/cache";
import { actionError } from "@/lib/action-result";
import type { ActionResult } from "@/lib/action-result";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { wilayaSeedData } from "@/lib/wilayas";
import { PublicActionError, runAction, zodMessage } from "@/lib/server-action";
import { shippingRateSchema, emptyInputSchema } from "@/lib/validation";

export async function saveShippingRate(input: unknown): Promise<ActionResult<null>> {
  const parsed = shippingRateSchema.safeParse(input);
  if (!parsed.success) return actionError(zodMessage(parsed.error));

  return runAction("saveShippingRate", async () => {
    await requireAdmin();
    const { code, ...data } = parsed.data;
    const result = await db().wilaya.updateMany({ where: { code }, data });
    if (result.count !== 1) throw new PublicActionError("الولاية غير موجودة.");
    revalidatePath("/admin/shipping");
    revalidatePath("/checkout");
    return null;
  });
}

export async function seedWilayas(input: unknown): Promise<ActionResult<{ count: number }>> {
  const parsed = emptyInputSchema.safeParse(input);
  if (!parsed.success) return actionError(zodMessage(parsed.error));

  return runAction("seedWilayas", async () => {
    await requireAdmin();
    await db().$transaction(
      wilayaSeedData.map(([code, nameAr, nameFr, homePrice, deskPrice]) =>
        db().wilaya.upsert({
          where: { code },
          update: { nameAr, nameFr },
          create: { code, nameAr, nameFr, homePrice, deskPrice },
        }),
      ),
    );
    revalidatePath("/admin/shipping");
    revalidatePath("/checkout");
    return { count: wilayaSeedData.length };
  });
}
