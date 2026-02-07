import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// RTL cleanup
afterEach(() => {
    cleanup();
});

// ✅ jsdom does not implement this
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    value: () => { },
    writable: true,
});
