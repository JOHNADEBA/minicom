export type Sender = 'visitor' | 'agent';
export type MessageStatus =
    | 'sending'
    | 'sent'
    | 'delivered'
    | 'read'
    | 'failed';


export interface Message {
    id: string;
    threadId: string;
    sender: Sender;
    body: string;
    createdAt: number;
    status?: MessageStatus;
    read: boolean;
}

export interface TypingEvent {
    threadId: string;
    sender: Sender;
    typing: boolean;
}
