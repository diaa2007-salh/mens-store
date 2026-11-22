import type { Metadata } from "next";
import { CartClient } from "@/components/cart-client";

export const metadata: Metadata = { title: "سلة المشتريات" };

export default function CartPage() {
  return (
    <div className="shell cart-page">
      <div className="page-title">
        <span className="eyebrow">اختياراتك</span>
        <h1>سلة المشتريات</h1>
      </div>
      <CartClient />
    </div>
  );
}
