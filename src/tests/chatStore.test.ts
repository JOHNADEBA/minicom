import { describe, it, expect, beforeEach } from "vitest";
import { useChatStore } from "@/store/chatStore";
import { MESSAGE_STATUS, ROLE } from "@/lib/constants";

describe("ChatStore (state transitions)", () => {
  beforeEach(() => {
    useChatStore.getState().reset();
  });

  it("orders messages by createdAt within a thread", () => {
    const store = useChatStore.getState();

    store.sendMessage({
      id: "2",
      threadId: "t1",
      body: "later",
      sender: ROLE.VISITOR,
      createdAt: 2,
      status: MESSAGE_STATUS.SENT,
      read: false,
    });

    store.sendMessage({
      id: "1",
      threadId: "t1",
      body: "earlier",
      sender: ROLE.VISITOR,
      createdAt: 1,
      status: MESSAGE_STATUS.SENT,
      read: false,
    });

    const msgs = useChatStore.getState().messages["t1"];

    expect(msgs.map((m) => m.id)).toEqual(["1", "2"]);
  });

  it("updates sender message status via markDelivered", () => {
    const store = useChatStore.getState();

    store.sendMessage({
      id: "m1",
      threadId: "t1",
      body: "hello",
      sender: ROLE.VISITOR,
      createdAt: 1,
      status: MESSAGE_STATUS.SENT,
      read: false,
    });

    store.markDelivered("m1");

    const updated = useChatStore
      .getState()
      .messages["t1"].find((m) => m.id === "m1");

    expect(updated?.status).toBe("delivered");
  });
});
