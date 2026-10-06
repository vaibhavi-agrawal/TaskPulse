import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TaskPulse | Kanban & Team Workload Balancing",
  description: "Next-gen collaborative Kanban board with automated server-side workload balancing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
