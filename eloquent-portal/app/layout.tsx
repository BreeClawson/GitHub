import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eloquent Digital Marketing — Client Portal",
  description: "Client portal for Eloquent Digital Marketing",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-stone-50 text-stone-900 antialiased">{children}</body>
    </html>
  );
}
