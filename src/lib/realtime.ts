import { Message, TypingEvent } from './models';
import { simulateNetwork } from './utils';
import { useChatStore } from '@/store/chatStore';
import { getRole } from './role';

let channel: BroadcastChannel | null = null;

export const initRealtime = () => {
    if (typeof window === 'undefined') return;

    if (!channel) {
        channel = new BroadcastChannel('minicom');

        channel.onmessage = (e) => {
            const { type, payload } = e.data;
            const store = useChatStore.getState();
            const role = getRole();

            switch (type) {
                case 'MESSAGE_SENT': {
  store.receiveRemoteMessage(payload);

  // If THIS TAB is the receiver
  if (payload.sender !== role) {
    // 1️⃣ Receiver publishes delivery ACK
    publish({
      type: 'MESSAGE_DELIVERED',
      payload: {
        id: payload.id,
        sender: payload.sender,
      },
    });
  }

  break;
}


                case 'MESSAGE_DELIVERED': {
                    // ✅ APPLY ONLY ON SENDER SIDE
                    if (payload.sender === role) {
                        store.markDelivered(payload.id);
                    }
                    break;
                }

                case 'MESSAGE_READ': {
                    // ✅ APPLY ONLY ON SENDER SIDE
                    if (payload.sender === role) {
                        store.markRead(payload.id);
                    }
                    break;
                }

                case 'FAILED':
                    store.failMessage(payload.id);
                    break;

                case 'TYPING':
                    store.setTyping(payload);
                    break;
            }
        };


    }
};

export const publish = (data: any) => {
    initRealtime();
    channel!.postMessage(data);
};

export const deliver = (msg: Message) => {
    initRealtime();

    setTimeout(() => {
        if (!simulateNetwork()) {
            // publish failure
            publish({
                type: 'FAILED',
                payload: { id: msg.id },
            });

            // mark locally as failed
            useChatStore.getState().failMessage(msg.id);
            return;
        }

        // ✅ local ACK
        useChatStore.getState().receiveMessage({
            ...msg,
            status: 'sent',
        });

        // ✅ cross-tab delivery
        publish({
            type: 'MESSAGE_SENT',
            payload: { ...msg, status: 'sent' },
        });
    }, 600);
};

export const sendTyping = (event: TypingEvent) => {
    publish({ type: 'TYPING', payload: event });
};
