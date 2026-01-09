import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Igényfelmérő Ügynök Chat",
  description: "AI Asszisztens üzleti igényfelméréshez",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}