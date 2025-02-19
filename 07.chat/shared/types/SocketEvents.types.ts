export {}

// Events emitted by the server to the client
export interface ServerToClientEvents {
    chatMessage: (payload: ChatMessageData) => void;
}

// Events emitted by the client to the server
export interface ClientToServerEvents {
    sendChatMessage: (payload: ChatMessageData) => void;
    userJoinRequest: (username: string, callback: (success: boolean) => void) => void;
}

// Message payload
export interface ChatMessageData {
	content: string;
    timestamp: number;
    username: string;
}