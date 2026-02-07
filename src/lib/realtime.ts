import { useChatStore } from "@/store/chatStore";

import { Message, RealtimePayload, TypingEvent } from "./models";
import { simulateNetwork } from "./utils";
import { getRole } from "./role";
import { EVENT, MESSAGE_STATUS } from "./constants";
import { playSound } from "./sound";

let channel: BroadcastChannel | null = null;

export const initRealtime = () => {
  if (typeof window === "undefined") return;

  if (!channel) {
    channel = new BroadcastChannel("minicom");

    channel.onmessage = (e: MessageEvent<RealtimePayload>) => {
      const { type, payload } = e.data;
      const store = useChatStore.getState();
      const role = getRole();

      switch (type) {
        case EVENT.MESSAGE_SENT: {
          store.receiveRemoteMessage(payload);

          // If THIS TAB is the receiver
          if (payload.sender !== role) {
            playSound();
            // 1️⃣ Receiver publishes delivery ACK
            publish({
              type: EVENT.MESSAGE_DELIVERED,
              payload: {
                id: payload.id,
                sender: payload.sender,
              },
            });
          }

          break;
        }

        case EVENT.MESSAGE_DELIVERED: {
          // ✅ APPLY ONLY ON SENDER SIDE
          if (payload.sender === role) {
            store.markDelivered(payload.id);
          }
          break;
        }

        case EVENT.MESSAGE_READ: {
          // ✅ APPLY ONLY ON SENDER SIDE
          if (payload.sender === role) {
            store.markRead(payload.id);
          }
          break;
        }

        case EVENT.MESSAGE_FAILED:
          store.failMessage(payload.id);
          break;

        case EVENT.TYPING:
          store.setTyping(payload);
          break;
      }
    };
  }
};

export const publish = (data: RealtimePayload) => {
  initRealtime();
  channel!.postMessage(data);
};

export const deliver = (msg: Message) => {
  initRealtime();

  setTimeout(() => {
    if (!simulateNetwork()) {
      // publish failure
      publish({
        type: EVENT.MESSAGE_FAILED,
        payload: { id: msg.id },
      });

      // mark locally as failed
      useChatStore.getState().failMessage(msg.id);
      return;
    }

    // ✅ local ACK
    useChatStore.getState().receiveMessage({
      ...msg,
      status: MESSAGE_STATUS.SENT,
    });

    // ✅ cross-tab delivery
    publish({
      type: EVENT.MESSAGE_SENT,
      payload: { ...msg, status: MESSAGE_STATUS.SENT },
    });
  }, 600);
};

export const sendTyping = (event: TypingEvent) => {
  publish({ type: EVENT.TYPING, payload: event });
};
