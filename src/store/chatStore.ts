import { create } from "zustand";

import { Message, TypingEvent } from "@/lib/models";
import { deliver } from "@/lib/realtime";
import { saveState, loadState } from "@/lib/persist";
import { getRole } from "@/lib/role";
import { MESSAGE_STATUS, ROLE } from "@/lib/constants";

interface ChatState {
  messages: Record<string, Message[]>;
  typing: Record<string, boolean>;
  offlineQueue: Message[];

  sendMessage: (m: Message) => void;
  receiveMessage: (m: Message) => void;
  receiveRemoteMessage: (m: Message) => void;

  markDelivered: (id: string) => void;
  markRead: (id: string) => void;
  failMessage: (id: string) => void;
  markThreadRead: (threadId: string) => void;

  retryMessage: (id: string) => void;
  retryOffline: () => void;

  setTyping: (e: TypingEvent) => void;
  reset: () => void;
}

const persisted = typeof window !== "undefined" ? loadState() : undefined;

export const useChatStore = create<ChatState>((set, get) => ({
  messages: persisted?.messages ? sanitizeMessages(persisted.messages) : {},
  typing: {},
  offlineQueue: persisted?.offlineQueue ?? [],

  sendMessage: (m) =>
    set((s) => {
      const next = {
        messages: upsertMessage(s.messages, m),
      };
      persist(next);
      return next;
    }),

  receiveMessage: (m) =>
    set((s) => {
      const next = {
        messages: upsertMessage(s.messages, m),
        offlineQueue: s.offlineQueue.filter((x) => x.id !== m.id),
      };

      persist(next);
      return next;
    }),

  receiveRemoteMessage: (m) =>
    set((s) => {
      const next = {
        messages: upsertMessage(s.messages, {
          ...m,
          status: undefined, // receiver never stores status
        }),
      };
      persist(next);
      return next;
    }),

  markDelivered: (id) =>
    set((s) => {
      const next = {
        messages: updateStatus(s.messages, id, MESSAGE_STATUS.DELIVERED),
        offlineQueue: s.offlineQueue.filter((m) => m.id !== id),
      };

      persist(next);
      return next;
    }),

  markRead: (id) =>
    set((s) => {
      const next = {
        messages: updateStatus(s.messages, id, MESSAGE_STATUS.READ),
      };
      persist(next);
      return next;
    }),

  markThreadRead: (threadId) =>
    set((s) => {
      const next = {
        messages: {
          ...s.messages,
          [threadId]: s.messages[threadId]?.map((m) =>
            m.sender === ROLE.VISITOR ? { ...m, read: true } : m,
          ),
        },
      };
      persist(next);
      return next;
    }),

  failMessage: (id) =>
    set((s) => {
      const updated = updateStatus(s.messages, id, MESSAGE_STATUS.FAILED);
      const failed = Object.values(updated)
        .flat()
        .find((m) => m.id === id);

      const next = failed
        ? {
            messages: updated,
            offlineQueue: [...s.offlineQueue, failed],
          }
        : { messages: updated };

      persist(next);
      return next;
    }),

  retryMessage: (id) => {
    const msg = Object.values(get().messages)
      .flat()
      .find((m) => m.id === id);

    if (!msg) return;

    const retry: Message = {
      ...msg,
      status: MESSAGE_STATUS.SENDING,
      createdAt: Date.now(),
    };

    get().sendMessage(retry);
    deliver(retry);
  },

  retryOffline: () => {
    const { offlineQueue } = get();

    offlineQueue.forEach((m) => {
      get().retryMessage(m.id);
    });
  },

  setTyping: ({ threadId, sender, typing }) =>
    set((s) => ({
      typing: { ...s.typing, [`${threadId}:${sender}`]: typing },
    })),

  reset: () => {
    clearPersisted();
    set({
      messages: {},
      typing: {},
      offlineQueue: [],
    });
  },
}));

function updateStatus(
  messages: Record<string, Message[]>,
  id: string,
  status: Message["status"],
) {
  const out: Record<string, Message[]> = {};
  for (const [tid, thread] of Object.entries(messages)) {
    out[tid] = thread.map((m) => (m.id === id ? { ...m, status } : m));
  }
  return out;
}

function upsertMessage(messages: Record<string, Message[]>, message: Message) {
  const thread = messages[message.threadId] ?? [];
  const exists = thread.find((m) => m.id === message.id);

  const next = exists
    ? thread.map((m) => (m.id === message.id ? { ...m, ...message } : m))
    : [...thread, message];

  next.sort((a, b) => a.createdAt - b.createdAt);

  return {
    ...messages,
    [message.threadId]: next,
  };
}

const persist = (state: Partial<ChatState>) => {
  saveState({
    messages: state.messages ?? useChatStore.getState().messages,
    offlineQueue: state.offlineQueue ?? useChatStore.getState().offlineQueue,
  });
};

function sanitizeMessages(messages: Record<string, Message[]>) {
  const role = getRole();

  const out: Record<string, Message[]> = {};

  for (const [threadId, msgs] of Object.entries(messages)) {
    out[threadId] = msgs.map((m) => {
      if (m.sender !== role) {
        // Receiver must NOT keep status
        const { status, ...rest } = m;
        return rest as Message;
      }
      return m;
    });
  }

  return out;
}

function clearPersisted() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("chat-store");
  }
}
