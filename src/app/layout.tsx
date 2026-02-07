import "./globals.css";
import { ClientProviders } from "@/components/client/ClientProviders";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          <ThemeToggle />
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
