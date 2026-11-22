import Link from "next/link";
import { Search } from "lucide-react";
import { db } from "@/lib/db";
import { formatDate, formatDzd } from "@/lib/format";
import { orderStatusLabels } from "@/lib/order-labels";
import { requireAdminPage } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const statuses = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
type OrdersAdminProps = {
  searchParams: Promise<{ status?: string; q?: string }>;
};

export default async function AdminOrdersPage({ searchParams }: OrdersAdminProps) {
  await requireAdminPage();
  const params = await searchParams;
  const q = params.q?.trim().slice(0, 100) ?? "";
  const status = statuses.includes(params.status as (typeof statuses)[number])
    ? params.status as (typeof statuses)[number]
    : undefined;
  const orders = await db().order.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q ? {
        OR: [
          { orderNumber: { contains: q, mode: "insensitive" } },
          { customerName: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
        ],
      } : {}),
    },
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      phone: true,
      status: true,
      totalAmount: true,
      createdAt: true,
      wilaya: { select: { nameAr: true } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <>
      <div className="admin-page-heading">
        <div><span className="admin-eyebrow">المبيعات</span><h1>الطلبات</h1><p>{orders.length} طلبات مطابقة</p></div>
      </div>
      <form className="admin-card admin-filters" action="/admin/orders">
        <label>البحث
          <input name="q" defaultValue={q} placeholder="اسم، هاتف، رقم الطلب..." />
        </label>
        <label>الحالة
          <select name="status" defaultValue={status ?? ""}>
            <option value="">كل الحالات</option>
            {statuses.map((value) => <option value={value} key={value}>{orderStatusLabels[value]}</option>)}
          </select>
        </label>
        <button className="admin-button" type="submit"><Search size={14} /> تصفية</button>
      </form>
      <section className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>رقم الطلب</th><th>العميل</th><th>رقم الهاتف</th><th>الولاية</th><th>المنتجات</th><th>الإجمالي</th><th>الحالة</th><th>التاريخ</th></tr></thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td><Link className="admin-order-link" href={`/admin/orders/${order.id}`}>{order.orderNumber}</Link></td>
                  <td>{order.customerName}</td>
                  <td dir="ltr">{order.phone}</td>
                  <td>{order.wilaya.nameAr}</td>
                  <td>{order._count.items}</td>
                  <td>{formatDzd(order.totalAmount)}</td>
                  <td><span className={`status-pill status-${order.status.toLowerCase()}`}>{orderStatusLabels[order.status]}</span></td>
                  <td>{formatDate(order.createdAt)}</td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td className="admin-empty" colSpan={8}>لا توجد طلبات تطابق البحث.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
