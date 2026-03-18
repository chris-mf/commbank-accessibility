import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CommBank Accessibility Branch Planning Assistant",
  description: "Plan your CommBank branch visit with personalised accessibility support",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-yellow-400 focus:text-gray-900">
          Skip to main content
        </a>
        <main id="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
