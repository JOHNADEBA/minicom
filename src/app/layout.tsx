import "./globals.css";
import { ClientProviders } from "@/components/client/ClientProviders";
import { AppHeader } from "@/components/layout/AppHeader";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="h-screen flex flex-col">
        <ClientProviders>
          {/* ✅ Global header */}
          <AppHeader />

          {/* ✅ App content */}
          <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
        </ClientProviders>
      </body>
    </html>
  );
}
