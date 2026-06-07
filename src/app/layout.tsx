import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "COSA WC",
  description: "Draft historical World Cup squads and simulate a World Cup campaign.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
