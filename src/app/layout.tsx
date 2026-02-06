import './globals.css';
import { ClientProviders } from '@/components/client/ClientProviders';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-black dark:bg-gray-900 dark:text-white transition-colors">
  <ClientProviders>
          <ThemeToggle />
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
