import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { SimpleCookieConsentBanner } from "./components/SimpleCookieConsentBanner";

export const metadata: Metadata = {
  title: "Clean Roster",
  description: "This is a clean roster app built with Next.js and Tailwind CSS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <AuthProvider>
          <SimpleCookieConsentBanner />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
