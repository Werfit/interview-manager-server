export const ChatIncomingEvents = {
  SendMessage: 'send-message',
} as const;

export const ChatOutgoingEvents = {
  AssistantMessage: 'assistant-message',
  AssistantMessageChunk: 'assistant-message-chunk',
} as const;
