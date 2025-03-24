import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HallOumi Demo",
  description: "Demo for the HallOumi claim verification model",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
