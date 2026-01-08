export interface ChatRoomDTO {
  id: string;
  participants: string[];
  lastMessagePreview?: string;
  lastMessageTime?: string; // Viene como string del backend
  unreadCounts?: Record<string, number>;
  active?: boolean; // A veces viene como isactive o active, ajusta según tu DTO java
}

// 1. Lo que responde el backend (Los 3 arrays separados)
export interface SendChatRoomsDTO {
  username: string[];
  chatRooms: ChatRoomDTO[];
  partnerAvatar: string[]; // En tu código antiguo se llamaba profilePhoto o partnerAvatar
}

// 2. Lo que usaremos en el componente (Objeto unificado)
export interface MappedRoom {
  roomId: string;
  name: string;      // Viene del array 'username'
  avatar: string;    // Viene del array 'partnerAvatar'
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
