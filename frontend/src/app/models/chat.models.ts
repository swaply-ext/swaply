//modelo para los mensajes del chat, de forma que el front entienda exactamente los mimsos campos que le llegan del backend
export interface ChatMessageDTO {
  id?: string;
  roomId: string;
  senderId: string;
  content: string;
  pageNumber?: number;
  timestamp?: string; 
}

export interface ChatRoomDTO {
  id: string;
  participants: string[];
  lastMessagePreview?: string;
  lastMessageTime?: string;
  lastMessageSenderId?: string;
  unreadCount?: Record<string, number>;
  isActive: boolean;
}

//DTO de back de envio de salas de chat
export interface SendChatRoomsDTO {
  username: string[];      //lista usernames
  chatRooms: ChatRoomDTO[]; //lista rooms
}

//Modelo para la vista del chat, que extiende del DTO y añade campos adicionales para la vista dfront
export interface ChatRoomViewModel extends ChatRoomDTO {
  displayUsername: string; //username q muestra
  displayAvatar: string;   //foto 
}