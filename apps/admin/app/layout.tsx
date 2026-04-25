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
  title: "ECP Admin Dashboard",
  description: "Enterprise Control Panel Admin",
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
