"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteProduct } from "@/app/admin/actions/products";

export function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function remove() {
    if (!window.confirm("حذف هذا المنتج نهائياً؟ لا يمكن التراجع عن هذا الإجراء.")) return;
    startTransition(async () => {
      const result = await deleteProduct({ id: productId });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("تم حذف المنتج.");
      router.replace("/admin/products");
      router.refresh();
    });
  }

  return (
    <button className="admin-button danger" type="button" onClick={remove} disabled={pending}>
      {pending ? "جارٍ الحذف..." : "حذف المنتج"}
    </button>
  );
}
