import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, Phone } from "lucide-react";
import { InternalNoteForm, OrderStatusActions } from "@/components/admin/order-actions";
import { db } from "@/lib/db";
import { formatDate, formatDzd, normalizeAlgerianPhone } from "@/lib/format";
import { nextOrderStatuses } from "@/lib/order-state";
import { orderStatusLabels } from "@/lib/order-labels";
import { requireAdminPage } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

type OrderDetailProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailPage({ params }: OrderDetailProps) {
  await requireAdminPage();
  const { id } = await params;
  const order = await db().order.findUnique({
    where: { id },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      customerName: true,
      phone: true,
      email: true,
      address: true,
      customerNote: true,
      internalNote: true,
      deliveryType: true,
      subtotal: true,
      shippingCost: true,
      totalAmount: true,
      stockDeducted: true,
      createdAt: true,
      updatedAt: true,
      wilaya: { select: { code: true, nameAr: true, nameFr: true } },
      items: {
        select: {
          id: true,
          productName: true,
          size: true,
          color: true,
          quantity: true,
          unitPrice: true,
          lineTotal: true,
          variant: { select: { stock: true } },
        },
      },
    },
  });
  if (!order) notFound();

  const phoneDigits = order.phone.replace(/[^\d+]/g, "");
  const message = `مرحباً ${order.customerName}، بخصوص طلبكم رقم ${order.orderNumber} بقيمة ${formatDzd(order.totalAmount)} من متجر مِداد.`;
  const whatsAppNumber = normalizeAlgerianPhone(order.phone);
  const whatsAppUrl = `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(message)}`;
  const deliveryLabel = order.deliveryType === "HOME" ? "توصيل إلى المنزل" : "استلام من المكتب";

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <Link className="admin-panel-link" href="/admin/orders">← كل الطلبات</Link>
          <h1>{order.orderNumber}</h1>
          <p>أُنشئ في {formatDate(order.createdAt)}</p>
        </div>
        <span className={`status-pill status-${order.status.toLowerCase()}`}>{orderStatusLabels[order.status]}</span>
      </div>
      <div className="admin-detail-grid">
        <div className="admin-detail-card admin-card">
          <h2>تفاصيل المنتجات</h2>
          {order.items.map((item) => (
            <div className="admin-order-item" key={item.id}>
              <span>{item.productName}<small>{item.size} · {item.color} · الكمية {item.quantity}</small></span>
              <strong>{formatDzd(item.lineTotal)}</strong>
            </div>
          ))}
          <dl className="detail-data-list" style={{ marginTop: 18 }}>
            <dt>المجموع الفرعي</dt><dd>{formatDzd(order.subtotal)}</dd>
            <dt>التوصيل</dt><dd>{formatDzd(order.shippingCost)}</dd>
            <dt>الطريقة</dt><dd>{deliveryLabel}</dd>
            <dt>المجموع الكلي</dt><dd className="admin-order-total">{formatDzd(order.totalAmount)}</dd>
          </dl>
        </div>
        <div className="admin-detail-card admin-card">
          <h2>بيانات العميل والتوصيل</h2>
          <dl className="detail-data-list">
            <dt>الاسم</dt><dd>{order.customerName}</dd>
            <dt>الهاتف</dt><dd dir="ltr">{order.phone}</dd>
            {order.email && <><dt>البريد</dt><dd>{order.email}</dd></>}
            <dt>الولاية</dt><dd>{order.wilaya.code} · {order.wilaya.nameAr} <small>{order.wilaya.nameFr}</small></dd>
            <dt>العنوان</dt><dd>{order.address}</dd>
            {order.customerNote && <><dt>ملاحظة العميل</dt><dd>{order.customerNote}</dd></>}
          </dl>
          <div className="admin-contact-actions">
            <a href={whatsAppUrl} target="_blank" rel="noreferrer"><MessageCircle size={14} /> مراسلة واتساب</a>
            <a href={`tel:${phoneDigits}`}><Phone size={14} /> اتصال</a>
          </div>
        </div>
        <div className="admin-detail-card admin-card">
          <h2>تحديث حالة الطلب</h2>
          {nextOrderStatuses(order.status).length ? (
            <OrderStatusActions orderId={order.id} statuses={nextOrderStatuses(order.status)} />
          ) : <p className="admin-empty">هذه الحالة نهائية ولا يمكن تغييرها.</p>}
          {order.stockDeducted && <p className="admin-panel-heading"><small>تم خصم المخزون لهذا الطلب.</small></p>}
        </div>
        <div className="admin-detail-card admin-card">
          <h2>ملاحظة داخلية</h2>
          <InternalNoteForm orderId={order.id} initialNote={order.internalNote ?? ""} />
        </div>
      </div>
    </>
  );
}
