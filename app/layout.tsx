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
          <div className="flex flex-row h-full min-h-screen container mx-auto">
            <div className="flex flex-row gap-4 w-full">
              <Sidebar />
              {children}
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
