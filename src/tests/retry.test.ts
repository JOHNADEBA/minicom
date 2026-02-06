import { describe, it, expect, beforeEach } from 'vitest';
import { useChatStore } from '@/store/chatStore';
import type { Message } from '@/lib/models';

describe('Retry failed messages (edge case)', () => {
  beforeEach(() => {
    useChatStore.getState().reset();
  });

  it('moves failed message back to sending on retry', () => {
  const store = useChatStore.getState();

  const msg: Message = {
    id: 'm1',
    threadId: 't1',
    body: 'fail me',
    sender: 'agent',
    createdAt: 1,
    status: 'sending',
    read: true,
  };

  // must exist first
  store.sendMessage(msg);

  // simulate failure
  store.failMessage(msg.id);

  // ✅ re-read AFTER failure
  let state = useChatStore.getState();
  const failed = state.messages['t1']!.find(m => m.id === msg.id);

  expect(failed?.status).toBe('failed');
  expect(state.offlineQueue.length).toBe(1);

  // retry
  store.retryMessage(msg.id);

  // ✅ re-read AFTER retry
  state = useChatStore.getState();
  const retried = state.messages['t1']!.find(m => m.id === msg.id);

  expect(retried?.status).toBe('sending');
});

});
