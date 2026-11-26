import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers/Providers";

export const metadata: Metadata = {
  title: "InvestIntel — Financial Analytics Platform",
  description: "Explore market trends, analyze investment performance, and uncover meaningful financial insights through data-driven analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col bg-[#050816] text-[#F9FAFB] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
