export const ROLE = {
  VISITOR: "visitor",
  AGENT: "agent",
} as const;

export const EVENT = {
  MESSAGE_SENT: "MESSAGE_SENT",
  MESSAGE_DELIVERED: "MESSAGE_DELIVERED",
  MESSAGE_READ: "MESSAGE_READ",
  MESSAGE_FAILED: "FAILED",
  TYPING: "TYPING",
} as const;

export enum MESSAGE_STATUS {
  SENDING = "sending",
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
  FAILED = "failed",
}

export type Role = (typeof ROLE)[keyof typeof ROLE];
export type EventType = (typeof EVENT)[keyof typeof EVENT];
