"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { seedWilayas, saveShippingRate } from "@/app/admin/actions/shipping";

type ShippingRate = {
  code: string;
  nameAr: string;
  nameFr: string;
  homePrice: number;
  deskPrice: number;
  isActive: boolean;
};

export function ShippingRateRow({ wilaya }: { wilaya: ShippingRate }) {
  const router = useRouter();
  const [homePrice, setHomePrice] = useState(wilaya.homePrice);
  const [deskPrice, setDeskPrice] = useState(wilaya.deskPrice);
  const [isActive, setIsActive] = useState(wilaya.isActive);
  const [pending, startTransition] = useTransition();
  const dirty =
    homePrice !== wilaya.homePrice ||
    deskPrice !== wilaya.deskPrice ||
    isActive !== wilaya.isActive;

  function submit() {
    startTransition(async () => {
      const result = await saveShippingRate({
        code: wilaya.code,
        homePrice,
        deskPrice,
        isActive,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(`تم تحديث ولاية ${wilaya.nameAr}.`);
      router.refresh();
    });
  }

  return (
    <tr>
      <td>{wilaya.code}</td>
      <td>{wilaya.nameAr}<small className="shipping-name-fr">{wilaya.nameFr}</small></td>
      <td>
          <input
            className="shipping-input"
            name="homePrice"
            type="number"
            min="0"
            max="100000"
            aria-label={`سعر التوصيل للمنزل إلى ${wilaya.nameAr}`}
            value={homePrice}
            onChange={(event) => setHomePrice(Number(event.target.value))}
          />
      </td>
      <td>
          <input
            className="shipping-input"
            name="deskPrice"
            type="number"
            min="0"
            max="100000"
            aria-label={`سعر التوصيل للمكتب إلى ${wilaya.nameAr}`}
            value={deskPrice}
            onChange={(event) => setDeskPrice(Number(event.target.value))}
          />
      </td>
      <td>
          <label className="admin-checkbox" aria-label={`تفعيل التوصيل إلى ${wilaya.nameAr}`}>
            <input name="isActive" type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
            {isActive ? "متاحة" : "موقوفة"}
          </label>
      </td>
      <td>
          <button className="admin-button secondary" type="button" onClick={submit} disabled={pending || !dirty}>
            {pending ? "جارٍ الحفظ..." : "حفظ"}
          </button>
      </td>
    </tr>
  );
}

export function SeedWilayasButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function seed() {
    if (!window.confirm("سيتم إضافة أو تحديث بيانات الولايات الـ58. هل تريد المتابعة؟")) return;
    startTransition(async () => {
      const result = await seedWilayas({});
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(`تم تحديث ${result.data.count} ولاية.`);
      router.refresh();
    });
  }

  return (
    <button className="admin-button secondary" type="button" onClick={seed} disabled={pending}>
      {pending ? "جارٍ تجهيز الولايات..." : "Seed all 58 wilayas"}
    </button>
  );
}
