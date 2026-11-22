"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { changeOrderStatus, saveInternalNote } from "@/app/admin/actions/orders";

const labels: Record<string, string> = {
  CONFIRMED: "تأكيد الطلب",
  SHIPPED: "تسجيل الشحن",
  DELIVERED: "تسجيل التسليم",
  CANCELLED: "إلغاء الطلب",
};

export function OrderStatusActions({
  orderId,
  statuses,
}: {
  orderId: string;
  statuses: readonly string[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function change(status: string) {
    if (status === "CANCELLED" && !window.confirm("هل أنت متأكد من إلغاء هذا الطلب؟")) return;
    startTransition(async () => {
      const result = await changeOrderStatus({ orderId, status });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(status === "CANCELLED" ? "تم إلغاء الطلب." : "تم تحديث حالة الطلب.");
      router.refresh();
    });
  }

  return (
    <div className="admin-status-actions">
      {statuses.map((status) => (
        <button
          className={`admin-button ${status === "CANCELLED" ? "danger" : ""}`}
          key={status}
          type="button"
          disabled={pending}
          onClick={() => change(status)}
        >
          {pending ? "جارٍ التحديث..." : labels[status] ?? status}
        </button>
      ))}
    </div>
  );
}

export function InternalNoteForm({
  orderId,
  initialNote,
}: {
  orderId: string;
  initialNote: string;
}) {
  const router = useRouter();
  const [note, setNote] = useState(initialNote);
  const [pending, startTransition] = useTransition();

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await saveInternalNote({
        orderId,
        internalNote: String(formData.get("internalNote") ?? ""),
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("تم حفظ الملاحظة الداخلية.");
      router.refresh();
    });
  }

  return (
    <form action={submit} className="admin-note-form">
      <textarea
        aria-label="ملاحظة داخلية"
        name="internalNote"
        value={note}
        onChange={(event) => setNote(event.target.value)}
        maxLength={2000}
        placeholder="أضف ملاحظة للفريق..."
      />
      <button className="admin-button secondary" type="submit" disabled={pending}>
        {pending ? "جارٍ الحفظ..." : "حفظ الملاحظة"}
      </button>
    </form>
  );
}
