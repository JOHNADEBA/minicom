export type Theme = 'dark' | 'light';

export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  return (localStorage.getItem('theme') as Theme) ?? 'dark';
}

export function setTheme(theme: Theme) {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;

  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  localStorage.setItem('theme', theme);
}

export function toggleTheme() {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
}
