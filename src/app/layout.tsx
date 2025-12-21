import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stock Portfolio App",
  description: "Track your stock portfolio",
  icons: {
    icon: "/logos/apple.png", // Using an existing logo as favicon
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors`}
      >
        <ErrorBoundary>
          <ClientProviders>
            <Header />
            {/* Main content handles its own scrolling */}
            <main className="flex-1 page-transition">{children}</main>
          </ClientProviders>
        </ErrorBoundary>
      </body>
    </html>
  );
}
