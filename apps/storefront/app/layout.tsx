import type { Metadata } from "next";
import { Inter } from "next/font/google";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import AuthInitializer from "@/components/auth/AuthInitializer";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Cacao Thai Snack Shop - Đồ Ăn Vặt & Nước Giải Khát Thái Lan Chính Hãng",
  description: "Chuyên đồ ăn vặt, snack mực Bento giòn rụm, trà sữa ChaTraMue và nước giải khát Thái Lan chính hãng nhập khẩu với giá tốt nhất.",
  icons: {
    icon: [
      { url: "/icon.jpg" },
      { url: "/logo/z7862984783113_196fdab6026e07fc4a13a745f502233b.jpg" }
    ],
    shortcut: "/icon.jpg",
    apple: "/logo/z7862984783113_196fdab6026e07fc4a13a745f502233b.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} font-sans antialiased bg-slate-50 text-slate-900 flex flex-col min-h-screen`}>
        <Toaster position="top-right" richColors />
        <AuthInitializer />
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
