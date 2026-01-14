import type { Metadata } from "next";
import "./globals.css";
import { DataProvider } from '@/context/DataContext';

export const metadata: Metadata = {
  title: "Deedox Education Platform",
  description: "Advanced Learning Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#050505] text-white">
        <DataProvider>
          {children}
        </DataProvider>
      </body>
    </html>
  );
}
