import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stock Portfolio App",
  description: "Track your stock portfolio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors`}
      >
        <ErrorBoundary>
          <ClientProviders>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </ClientProviders>
        </ErrorBoundary>
      </body>
    </html>
  );
}
