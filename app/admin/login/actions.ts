"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { actionError } from "@/lib/action-result";
import type { ActionResult } from "@/lib/action-result";
import { createAdminToken, setAdminCookie } from "@/lib/session";
import { checkRateLimit, requestIp } from "@/lib/rate-limit";
import {
  PublicActionError,
  runAction,
  zodMessage,
} from "@/lib/server-action";
import { adminLoginSchema } from "@/lib/validation";

export async function loginAdmin(
  input: unknown,
): Promise<ActionResult<{ email: string }>> {
  const parsed = adminLoginSchema.safeParse(input);
  if (!parsed.success) return actionError(zodMessage(parsed.error));

  const ip = requestIp(await headers());
  if (!checkRateLimit(`admin-login:${ip}`, 5, 15 * 60 * 1000)) {
    return actionError("محاولات كثيرة. يرجى الانتظار 15 دقيقة ثم المحاولة مجدداً.");
  }

  return runAction("loginAdmin", async () => {
    const expectedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const passwordHash = process.env.ADMIN_PASSWORD_HASH;
    const email = parsed.data.email.toLowerCase();

    if (!expectedEmail || !passwordHash) {
      console.error("ADMIN_EMAIL or ADMIN_PASSWORD_HASH is not configured.");
      throw new PublicActionError("إعدادات تسجيل الدخول غير مكتملة. يرجى التواصل مع المسؤول.");
    }

    const passwordMatches = await bcrypt.compare(parsed.data.password, passwordHash);
    if (email !== expectedEmail || !passwordMatches) {
      throw new PublicActionError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
    }

    const token = await createAdminToken(email);
    await setAdminCookie(token);
    revalidatePath("/admin");
    return { email };
  });
}
