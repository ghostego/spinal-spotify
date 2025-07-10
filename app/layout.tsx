import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/app/components/sidebar"
import { AuthProvider } from "@/src/context/AuthContext";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "spotify",
  description: "spotify",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="flex flex-row h-full">
            <Sidebar />
            <div
              className="flex flex-row gap-4 w-3/4 offset-1/4"
            >
              {children}
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
