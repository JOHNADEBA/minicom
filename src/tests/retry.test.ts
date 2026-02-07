import { describe, it, expect, beforeEach } from "vitest";

import { useChatStore } from "@/store/chatStore";
import type { Message } from "@/lib/models";
import { MESSAGE_STATUS, ROLE } from "@/lib/constants";

describe("Retry failed messages (edge case)", () => {
  beforeEach(() => {
    useChatStore.getState().reset();
  });

  it("moves failed message back to sending on retry", () => {
    const store = useChatStore.getState();

    const msg: Message = {
      id: "m1",
      threadId: "t1",
      body: "fail me",
      sender: ROLE.AGENT,
      createdAt: 1,
      status: MESSAGE_STATUS.SENDING,
      read: true,
    };

    store.sendMessage(msg);
    store.failMessage(msg.id);

    let state = useChatStore.getState();
    const failed = state.messages["t1"].find((m) => m.id === msg.id);

    expect(failed?.status).toBe(MESSAGE_STATUS.FAILED);
    expect(state.offlineQueue).toHaveLength(1);

    store.retryMessage(msg.id);

    state = useChatStore.getState();
    const retried = state.messages["t1"].find((m) => m.id === msg.id);

    expect(retried?.status).toBe(MESSAGE_STATUS.SENDING);
  });
});
