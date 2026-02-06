const THREAD_KEY = 'minicom:threadId';

export function getThreadId(): string {
  if (typeof window === 'undefined') return 'server';

  let id = sessionStorage.getItem(THREAD_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(THREAD_KEY, id);
  }

  return id;
}
