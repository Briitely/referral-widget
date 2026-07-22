import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Leads by Referral Source",
  description: "Briitely referral-source dashboard widget for HighLevel"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
