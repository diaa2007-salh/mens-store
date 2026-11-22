import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { requireAdminPage } from "@/lib/admin-auth";

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const session = await requireAdminPage();

  return (
    <div className="admin-body" dir="rtl">
      <AdminSidebar email={session.email} />
      <div className="admin-main">
        <header className="admin-topbar">
          <span className="admin-topbar-title">إدارة المتجر <span aria-hidden="true">/</span> مِداد</span>
          <div className="admin-topbar-right">
            <span className="admin-avatar" aria-hidden="true">{session.email.slice(0, 1).toUpperCase()}</span>
            <span>المسؤول</span>
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
