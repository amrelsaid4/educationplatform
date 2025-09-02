import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "TOTC - منصة التعلم الرقمي",
  description: "منصة تعليمية حديثة للطلاب والمعلمين والإداريين",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased">
        <QueryProvider>
          <ThemeProvider>
            <AuthProvider>
              {children}
              <ToastProvider />
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
