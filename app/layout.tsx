import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const inter = localFont({
  src: [
    { path: "../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2", weight: "100 900", style: "normal" },
    { path: "../node_modules/@fontsource-variable/inter/files/inter-latin-ext-wght-normal.woff2", weight: "100 900", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "sayidwithenglish", template: "%s · sayidwithenglish" },
  description: "Kendi kelimelerinle, daha derin, daha kalıcı öğren. Kişisel İngilizce çalışma alanın.",
};

export const viewport: Viewport = { themeColor: "#080C14", colorScheme: "dark", viewportFit: "cover" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="tr" className={inter.variable}><body>{children}</body></html>;
}
