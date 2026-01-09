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
    // A suppressHydrationWarning segít elnyomni a bővítmények vagy apró eltérések miatti hibákat
    <html lang="hu" suppressHydrationWarning>
      <body className="antialiased font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
