import Link from "next/link";
import { Check } from "lucide-react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate, formatDzd } from "@/lib/format";

export const dynamic = "force-dynamic";

type ConfirmationProps = {
  searchParams: Promise<{ order?: string }>;
};

export default async function OrderConfirmationPage({ searchParams }: ConfirmationProps) {
  const { order: orderNumber } = await searchParams;
  if (!orderNumber || !/^MS-[A-Z0-9-]{8,40}$/.test(orderNumber)) notFound();
  const order = await db().order.findUnique({
    where: { orderNumber },
    select: {
      orderNumber: true,
      status: true,
      totalAmount: true,
      createdAt: true,
    },
  });
  if (!order) notFound();

  return (
    <div className="shell confirmation-page">
      <div className="confirmation-card">
        <span className="confirmation-check"><Check size={26} /></span>
        <span className="eyebrow">تم استلام طلبك</span>
        <h1>شكراً لاختيارك مِداد.</h1>
        <p>سيتم التواصل معك هاتفياً لتأكيد تفاصيل التوصيل.</p>
        <div className="confirmation-order-number">
          <span>رقم الطلب</span><strong>{order.orderNumber}</strong>
        </div>
        <div className="confirmation-summary">
          <span>{formatDate(order.createdAt)}</span>
          <strong>{formatDzd(order.totalAmount)}</strong>
        </div>
        <Link className="button button-dark button-full" href="/products">تابع اكتشاف التشكيلة</Link>
      </div>
    </div>
  );
}
