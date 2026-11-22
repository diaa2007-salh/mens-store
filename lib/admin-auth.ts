import "server-only";

import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/session";

export async function isAdminAuthenticated() {
  return Boolean(await getAdminSession());
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("غير مصرح. يرجى تسجيل الدخول مجدداً.");
  }
  return session;
}

export async function requireAdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
