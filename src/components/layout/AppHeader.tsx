import { ThemeToggle } from "../ui/ThemeToggle";

export function AppHeader() {
  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-gray-700">
      <span className="font-semibold">Minicom</span>
      <ThemeToggle />
    </header>
  );
}
