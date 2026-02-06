export type Role = 'visitor' | 'agent';

export const getRole = (): Role => {
    if (typeof window === 'undefined') return 'visitor';
    return window.location.pathname.startsWith('/agent')
        ? 'agent'
        : 'visitor';
};
