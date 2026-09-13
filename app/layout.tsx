import GlobalLogout from "@/components/auth/GlobalLogout";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CampusMind AI",
  description: "AI-powered student productivity and academic management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>`r`n        <GlobalLogout />{children}</body>
    </html>
  );
}

