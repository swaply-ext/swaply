export interface ChatRoomDTO {
  id: string;
  participants: string[];
  lastMessagePreview?: string;
  lastMessageTime?: string;
  unreadCounts?: Record<string, number>;
  active?: boolean;
}

export interface SendChatRoomsDTO {
  username: string[];
  chatRooms: ChatRoomDTO[];
  partnerAvatar: string[];
}

export interface MappedRoom {
  roomId: string;
  name: string;
  avatar: string;
  details: ChatRoomDTO;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  timestamp: string;
}

// Payload para enviar mensaje
export interface SendMessagePayload {
  roomId: string;
  content: string;
}
