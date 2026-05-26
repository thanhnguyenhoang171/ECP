import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "../src/index.css";
import Providers from "@/components/providers";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  adjustFontFallback: true 
});

export const metadata: Metadata = {
  title: "CACAO Admin Dashboard",
  description: "Cacao Admin Panel",
  icons: {
    icon: "/logo/z7862984783113_196fdab6026e07fc4a13a745f502233b.jpg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
