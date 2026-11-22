import Link from "next/link";
import { AlertTriangle, Banknote, ClipboardList, PackageCheck, ShoppingBag } from "lucide-react";
import { OrdersChart } from "@/components/admin/orders-chart";
import { db } from "@/lib/db";
import { formatDate, formatDzd } from "@/lib/format";
import { requireAdminPage } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const statusNames: Record<string, string> = {
  PENDING: "قيد الانتظار",
  CONFIRMED: "مؤكد",
  SHIPPED: "تم الشحن",
  DELIVERED: "تم التسليم",
  CANCELLED: "ملغي",
};

export default async function AdminDashboardPage() {
  await requireAdminPage();
  const today = new Date();
  const dateParts = new Intl.DateTimeFormat("en", {
    timeZone: "Africa/Algiers",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(today);
  const year = Number(dateParts.find((part) => part.type === "year")?.value);
  const month = Number(dateParts.find((part) => part.type === "month")?.value);
  const day = Number(dateParts.find((part) => part.type === "day")?.value);
  const firstDay = new Date(Date.UTC(year, month - 1, day - 13, -1));
  const dayKey = (date: Date) => {
    const parts = new Intl.DateTimeFormat("en", {
      timeZone: "Africa/Algiers",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);
    return [
      parts.find((part) => part.type === "year")?.value,
      parts.find((part) => part.type === "month")?.value,
      parts.find((part) => part.type === "day")?.value,
    ].join("-");
  };

  const [revenue, orderCount, pendingCount, lowStockCount, lowStock, orders, recentOrders] =
    await Promise.all([
      db().order.aggregate({
        where: { status: "DELIVERED" },
        _sum: { totalAmount: true },
      }),
      db().order.count(),
      db().order.count({ where: { status: "PENDING" } }),
      db().variant.count({
        where: { stock: { lte: 3 }, isActive: true, product: { isActive: true } },
      }),
      db().variant.findMany({
        where: { stock: { lte: 3 }, isActive: true, product: { isActive: true } },
        select: {
          id: true,
          size: true,
          color: true,
          stock: true,
          product: { select: { name: true } },
        },
        orderBy: { stock: "asc" },
        take: 8,
      }),
      db().order.findMany({
        where: { createdAt: { gte: firstDay } },
        select: { createdAt: true },
      }),
      db().order.findMany({
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          status: true,
          totalAmount: true,
          createdAt: true,
          wilaya: { select: { nameAr: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

  const countsByDay = new Map<string, number>();
  for (const order of orders) {
    const key = dayKey(order.createdAt);
    countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1);
  }
  const chartDays = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(firstDay.getTime() + index * 24 * 60 * 60 * 1000);
    const key = dayKey(date);
    return {
      label: new Intl.DateTimeFormat("ar-DZ", { day: "numeric", month: "numeric" }).format(date),
      count: countsByDay.get(key) ?? 0,
    };
  });

  return (
    <>
      <div className="admin-page-heading">
        <div><span className="admin-eyebrow">نظرة عامة</span><h1>لوحة التحكم</h1></div>
        <span className="admin-topbar-title">{formatDate(new Date())}</span>
      </div>
      <section className="admin-stats" aria-label="إحصائيات المتجر">
        <article className="admin-card admin-stat">
          <div className="admin-stat-title"><span>إيرادات الطلبات المسلّمة</span><span className="admin-stat-icon"><Banknote size={16} /></span></div>
          <strong>{formatDzd(revenue._sum.totalAmount ?? 0)}</strong><small>إجمالي المبالغ المُسلّمة فقط</small>
        </article>
        <article className="admin-card admin-stat">
          <div className="admin-stat-title"><span>إجمالي الطلبات</span><span className="admin-stat-icon"><ShoppingBag size={16} /></span></div>
          <strong>{orderCount.toLocaleString("ar-DZ")}</strong><small>كل الحالات</small>
        </article>
        <article className="admin-card admin-stat">
          <div className="admin-stat-title"><span>طلبات قيد الانتظار</span><span className="admin-stat-icon"><ClipboardList size={16} /></span></div>
          <strong>{pendingCount.toLocaleString("ar-DZ")}</strong><small>بحاجة إلى المتابعة</small>
        </article>
        <article className="admin-card admin-stat">
          <div className="admin-stat-title"><span>تنبيهات المخزون</span><span className="admin-stat-icon"><AlertTriangle size={16} /></span></div>
          <strong>{lowStockCount.toLocaleString("ar-DZ")}</strong><small>مخزون 3 قطع أو أقل</small>
        </article>
      </section>

      <div className="admin-dashboard-grid">
        <section className="admin-card admin-panel">
          <div className="admin-panel-heading">
            <div><h2>الطلبات خلال آخر 14 يوماً</h2><p>عدد الطلبات المستلمة يومياً</p></div>
          </div>
          <OrdersChart days={chartDays} />
        </section>
        <section className="admin-card admin-panel">
          <div className="admin-panel-heading">
            <div><h2>مخزون منخفض</h2><p>أعد التزويد عند الحاجة</p></div>
            <PackageCheck size={17} color="#55705e" />
          </div>
          {lowStock.length ? (
            <div className="admin-low-stock">
              {lowStock.map((variant) => (
                <div className="low-stock-row" key={variant.id}>
                  <span>{variant.product.name}<small>{variant.size} · {variant.color}</small></span>
                  <b className="stock-badge">{variant.stock}</b>
                </div>
              ))}
            </div>
          ) : <p className="admin-empty">لا توجد تنبيهات مخزون حالياً.</p>}
        </section>
      </div>

      <section className="admin-card admin-panel admin-orders-panel">
        <div className="admin-panel-heading">
          <div><h2>أحدث الطلبات</h2><p>آخر 10 طلبات تم استلامها</p></div>
          <Link className="admin-panel-link" href="/admin/orders">عرض كل الطلبات ←</Link>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>رقم الطلب</th><th>العميل</th><th>الولاية</th><th>المنتجات</th><th>الإجمالي</th><th>الحالة</th><th>التاريخ</th></tr></thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td><Link className="admin-order-link" href={`/admin/orders/${order.id}`}>{order.orderNumber}</Link></td>
                  <td>{order.customerName}</td>
                  <td>{order.wilaya.nameAr}</td>
                  <td>{order._count.items}</td>
                  <td>{formatDzd(order.totalAmount)}</td>
                  <td><span className={`status-pill status-${order.status.toLowerCase()}`}>{statusNames[order.status]}</span></td>
                  <td>{formatDate(order.createdAt)}</td>
                </tr>
              ))}
              {recentOrders.length === 0 && <tr><td className="admin-empty" colSpan={7}>لا توجد طلبات بعد.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
