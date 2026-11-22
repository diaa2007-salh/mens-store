"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loginAdmin } from "@/app/admin/login/actions";

export function AdminLoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function submit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await loginAdmin({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      });
      if (!result.success) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success("مرحباً بك.");
      router.replace(nextPath);
      router.refresh();
    });
  }

  return (
    <form action={submit} className="login-form">
      <label htmlFor="email">البريد الإلكتروني
        <input id="email" name="email" type="email" autoComplete="username" required maxLength={254} />
      </label>
      <label htmlFor="password">كلمة المرور
        <input id="password" name="password" type="password" autoComplete="current-password" required maxLength={200} />
      </label>
      {error && <p className="login-error" role="alert">{error}</p>}
      <button className="admin-button" type="submit" disabled={pending}>
        {pending ? "جارٍ التحقق..." : "دخول"}
      </button>
    </form>
  );
}
