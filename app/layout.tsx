import type { Metadata, Viewport } from "next";
import "./globals.css";
import ClientProviders from "./providers/ClientProviders";

export const metadata: Metadata = {
  title: "ChatHub",
  description: "Enterprise real-time chat application",
  applicationName: "ChatHub",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ChatHub",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientProviders />
        {children}
      </body>
    </html>
  );
}