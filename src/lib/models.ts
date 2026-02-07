import type { EVENT, MESSAGE_STATUS, Role } from "./constants";

export type Sender = Role;

export interface Message {
  id: string;
  threadId: string;
  sender: Sender;
  body: string;
  createdAt: number;
  status?: MESSAGE_STATUS;
  read: boolean;
}

export interface TypingEvent {
  threadId: string;
  sender: Sender;
  typing: boolean;
}

export type RealtimePayload =
  | { type: typeof EVENT.MESSAGE_SENT; payload: Message }
  | {
      type: typeof EVENT.MESSAGE_DELIVERED;
      payload: { id: string; sender: string };
    }
  | { type: typeof EVENT.MESSAGE_READ; payload: { id: string; sender: string } }
  | { type: typeof EVENT.MESSAGE_FAILED; payload: { id: string } }
  | { type: typeof EVENT.TYPING; payload: TypingEvent };
