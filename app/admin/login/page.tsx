import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-login-form";
import { getAdminSession } from "@/lib/session";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (await getAdminSession()) redirect("/admin");
  const nextPath = (await searchParams).next;
  const safeNextPath =
    (nextPath === "/admin" || nextPath?.startsWith("/admin/")) &&
    !nextPath?.startsWith("/admin/login")
      ? nextPath
      : "/admin";

  return (
    <main className="login-page" dir="rtl">
      <section className="login-card">
        <div className="brand">
          <span className="brand-mark">م</span><span>مِداد<span className="brand-dot">.</span></span>
        </div>
        <span className="admin-eyebrow">مساحة خاصة</span>
        <h1>تسجيل الدخول</h1>
        <p>أدخل بيانات المسؤول للوصول إلى لوحة التحكم.</p>
        <AdminLoginForm nextPath={safeNextPath} />
      </section>
    </main>
  );
}
