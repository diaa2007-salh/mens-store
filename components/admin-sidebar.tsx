"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  LogOut,
  Menu,
  Truck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { logoutAdmin } from "@/app/admin/actions/auth";

const links = [
  { href: "/admin", label: "لوحة التحكم", icon: BarChart3, exact: true },
  { href: "/admin/products", label: "المنتجات", icon: Boxes },
  { href: "/admin/orders", label: "الطلبات", icon: ClipboardList },
  { href: "/admin/shipping", label: "الشحن", icon: Truck },
];

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function signOut() {
    startTransition(async () => {
      const result = await logoutAdmin({});
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("تم تسجيل الخروج.");
      router.replace("/admin/login");
      router.refresh();
    });
  }

  return (
    <>
      <button
        className="admin-menu-toggle icon-button"
        type="button"
        aria-label={open ? "إغلاق قائمة الإدارة" : "فتح قائمة الإدارة"}
        aria-expanded={open}
        aria-controls="admin-sidebar"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      {open && (
        <button
          className="admin-mobile-overlay"
          type="button"
          aria-label="إغلاق القائمة"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={`admin-sidebar ${open ? "mobile-open" : ""}`} id="admin-sidebar">
        <Link className="brand" href="/admin" onClick={() => setOpen(false)}>
          <span className="brand-mark">م</span><span>مِداد<span className="brand-dot">.</span></span>
        </Link>
        <span className="admin-nav-label">القائمة الرئيسية</span>
        <nav className="admin-nav" aria-label="قائمة الإدارة">
          {links.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                href={href}
                key={href}
                className={active ? "active" : ""}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                <Icon size={17} strokeWidth={1.8} /><span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="admin-sidebar-footer">
          <span>{email}</span>
          <button type="button" onClick={signOut} disabled={pending}>
            <LogOut size={15} />{pending ? "جارٍ الخروج..." : "تسجيل الخروج"}
          </button>
        </div>
      </aside>
    </>
  );
}
