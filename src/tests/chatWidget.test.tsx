import { render, fireEvent, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";

import { useChatStore } from "@/store/chatStore";
import { ChatWidget } from "@/components/visitor/ChatWidget";
import { MESSAGE_STATUS } from "@/lib/constants";

describe("ChatWidget (UI interaction)", () => {
  beforeEach(() => {
    useChatStore.getState().reset();
  });

  it("sends a message when Enter is pressed", () => {
    render(<ChatWidget />);

    // open chat
    fireEvent.click(screen.getByRole("button", { name: /open chat/i }));

    const input = screen.getByPlaceholderText(/type a message/i);

    fireEvent.change(input, {
      target: { value: "Hello world" },
    });

    fireEvent.keyDown(input, {
      key: "Enter",
      code: "Enter",
    });

    const messagesByThread = useChatStore.getState().messages;
    const threadId = Object.keys(messagesByThread)[0];
    const msgs = messagesByThread[threadId];

    expect(msgs).toHaveLength(1);
    expect(msgs[0].body).toBe("Hello world");
    expect(msgs[0].status).toBe(MESSAGE_STATUS.SENDING);
  });
});
