import type { Metadata } from "next";
import { Toaster } from "sonner";
import { CartHydration } from "@/components/cart-hydration";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "مِداد | أزياء رجالية مختارة",
    template: "%s | مِداد",
  },
  description: "أزياء رجالية يومية مختارة بعناية، مع توصيل إلى جميع ولايات الجزائر.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <CartHydration />
        {children}
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            classNames: { toast: "app-toast", title: "app-toast-title" },
          }}
        />
      </body>
    </html>
  );
}
