import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ChatWidget } from '@/components/visitor/ChatWidget';
import { useChatStore } from '@/store/chatStore';

describe('ChatWidget (UI interaction)', () => {
  beforeEach(() => {
    useChatStore.getState().reset();
  });

  it('sends a message when user presses Enter', () => {
    render(<ChatWidget />);

    // open widget
    fireEvent.click(screen.getByRole('button'));

    const input = screen.getByPlaceholderText(/type a message/i);

    fireEvent.change(input, {
      target: { value: 'Hello world' },
    });

    fireEvent.keyDown(input, {
      key: 'Enter',
      code: 'Enter',
    });

    const messagesByThread = useChatStore.getState().messages;
    const threadIds = Object.keys(messagesByThread);

    expect(threadIds.length).toBe(1);

    const msgs = messagesByThread[threadIds[0]];
    expect(msgs).toHaveLength(1);
    expect(msgs[0].body).toBe('Hello world');
    expect(msgs[0].status).toBe('sending');
  });
});
