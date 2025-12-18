import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Observable, Subject } from 'rxjs';

// --- INTERFACES ---
export interface ChatMessage {
  id?: string;
  roomId: string;
  senderId: string;
  content: string;
  timestamp?: string; 
}

export interface ChatRoom {
  id: string;
  participants: string[];
  lastMessagePreview?: string;
  lastMessageTime?: string;
  lastMessageSenderId?: string;
  isActive: boolean;
  chatName?: string; // Para mostrar nombre en el HTML
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  
  private stompClient: Client | null = null;
  // URLs directas
  private readonly API_URL = 'http://localhost:8081/api/chat'; 
  private readonly SOCKET_URL = 'http://localhost:8081/ws-chat';

  private messageSubject = new Subject<ChatMessage>();

  constructor(private http: HttpClient) {}

  

  // --- REST ---

  getMyRooms(): Observable<ChatRoom[]> {
    return this.http.get<ChatRoom[]>(`${this.API_URL}/rooms`);
  }

  getChatHistory(roomId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.API_URL}/history/${roomId}`);
  }

  createRoom(targetUserId: string): Observable<ChatRoom> {
    return this.http.post<ChatRoom>(`${this.API_URL}/rooms/create/${targetUserId}`, {});
  }

  // --- WEBSOCKETS ---

  connect(jwtToken: string) {
    const socket = new SockJS(this.SOCKET_URL);
    
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${jwtToken}`
      },
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
    });

    this.stompClient.onConnect = (frame) => {
      console.log('Conectado al Chat');
    };

    this.stompClient.activate();
  }

  joinRoom(roomId: string) {
    if (this.stompClient && this.stompClient.connected) {
      return this.stompClient.subscribe(`/topic/room/${roomId}`, (message: Message) => {
        const parsedMessage: ChatMessage = JSON.parse(message.body);
        this.messageSubject.next(parsedMessage);
      });
    }
    return null;
  }

  sendMessage(roomId: string, content: string, senderId: string) {
    if (this.stompClient && this.stompClient.connected) {
      const chatMessage: ChatMessage = {
        roomId: roomId,
        content: content,
        senderId: senderId
      };

      this.stompClient.publish({
        destination: `/app/chat.send/${roomId}`,
        body: JSON.stringify(chatMessage)
      });
    }
  }

  

  onNewMessage(): Observable<ChatMessage> {
    return this.messageSubject.asObservable();
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
    }
  }
}