import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StoreProvider from "./StoreProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SmartServe AI - Intelligent Restaurant Management System",
  description: "A complete AI-powered restaurant ERP and POS solution for modern restaurants. Manage orders, inventory, employees, and grow your business with AI insights.",
  keywords: "restaurant management, POS, ERP, AI, inventory, orders",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans antialiased">
        <StoreProvider>
          {children}
          <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: '#1f2937', color: '#f9fafb', border: '1px solid #374151' } }} />
        </StoreProvider>
      </body>
    </html>
  );
}
