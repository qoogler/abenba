import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "מאמן הרצאות — הדרך לאולם הפרו",
  description: "מאמן הרצאות אישי שיעזור לך להגיע לרמת פרו. טיפים, תרגול ומעקב התקדמות.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className="antialiased">
        <Navbar />
        <main className="mx-auto min-h-screen max-w-5xl px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
