import { describe, it, expect, beforeEach } from 'vitest';
import { useChatStore } from '@/store/chatStore';
import type { Message } from '@/lib/models';

describe('ChatStore (state transitions)', () => {
  beforeEach(() => {
    useChatStore.getState().reset();
  });

  it('orders messages by createdAt within a thread', () => {
    const store = useChatStore.getState();

    store.sendMessage({
      id: '2',
      threadId: 't1',
      body: 'later',
      sender: 'visitor' as const,
      createdAt: 2,
      status: 'sent' as const,
      read: false,
    });


    store.sendMessage({
      id: '1',
      threadId: 't1',
      body: 'earlier',
      sender: 'visitor' as const,
      createdAt: 1,
      status: 'sent' as const,
      read: false,
    });

    const msgs = useChatStore.getState().messages['t1'];

    expect(msgs).toBeDefined();

    expect(msgs.map(m => m.id)).toEqual(['1', '2']);
  });


  it('updates sender message status via markDelivered', () => {
    const store = useChatStore.getState();

    const msg = {
      id: 'm1',
      threadId: 't1',
      body: 'hello',
      sender: 'visitor' as const,
      createdAt: 1,
      status: 'sent' as const,
      read: false,
    };

    store.sendMessage(msg);
    store.markDelivered(msg.id);

    // ✅ re-read state AFTER mutations
    const messages = useChatStore.getState().messages['t1'];

    expect(messages).toBeDefined();

    const updated = messages!.find(m => m.id === msg.id);
    expect(updated?.status).toBe('delivered');
  });


});