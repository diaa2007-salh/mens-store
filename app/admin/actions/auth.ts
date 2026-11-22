"use server";

import { revalidatePath } from "next/cache";
import { actionError } from "@/lib/action-result";
import type { ActionResult } from "@/lib/action-result";
import { requireAdmin } from "@/lib/admin-auth";
import { clearAdminCookie } from "@/lib/session";
import { runAction, zodMessage } from "@/lib/server-action";
import { emptyInputSchema } from "@/lib/validation";

export async function logoutAdmin(input: unknown): Promise<ActionResult<null>> {
  const parsed = emptyInputSchema.safeParse(input);
  if (!parsed.success) return actionError(zodMessage(parsed.error));

  return runAction("logoutAdmin", async () => {
    await requireAdmin();
    await clearAdminCookie();
    revalidatePath("/admin");
    return null;
  });
}
