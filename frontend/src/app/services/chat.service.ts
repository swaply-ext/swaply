import { Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { SKIP_LOADING } from '../interceptors/loading.interceptor';
import { Client, Message as StompMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface ChatRoomDTO {
  id: string;
  participants: string[];
  lastMessagePreview?: string;
  lastMessageTime?: string;
  unreadCounts?: Record<string, number>;
}

export interface SendChatRoomsDTO {
  username: string[];
  chatRooms: ChatRoomDTO[];
  partnerAvatar: string[];
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  timestamp: string;
}

// chat.service.ts

@Injectable({ providedIn: 'root' })
export class ChatService {
  private base = 'http://localhost:8081/api/chat';
  private client: Client | null = null;
  private roomSubjects = new Map<string, Subject<ChatMessage>>();
  public currentUserId: string = '';

  private _connectedPromise: Promise<void> | null = null;

  constructor(private http: HttpClient) {}

  //OBTENER ROOMS (no va por backend error 500)
  getRooms(): Observable<SendChatRoomsDTO> {
    return this.http.get<SendChatRoomsDTO>(`${this.base}/rooms`, {
      context: new HttpContext().set(SKIP_LOADING, true)
    });
  }

  //obtener el historial SI Q FUNCIONA DE UNA ROOM
  getHistory(roomId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.base}/history/${roomId}`);
  }

  //CREAR UNA ROOM
  createRoomWithUsername(targetUsername: string): Observable<ChatRoomDTO> {
    return this.http.post<ChatRoomDTO>(`${this.base}/rooms/create/${targetUsername}`, {});
  }

  //logica WEBSOCKET API
  async connectIfNeeded(authToken?: string): Promise<void> {
    if (this.client && this.client.active) return;
    if (this._connectedPromise) return this._connectedPromise;

    this._connectedPromise = new Promise((resolve, reject) => {
      const factory = () => new SockJS('http://localhost:8081/ws-chat');

      this.client = new Client({
        webSocketFactory: factory,
        connectHeaders: {
          Authorization: `Bearer ${authToken}`
        },
        debug: (str) => console.log('[STOMP]: ' + str),
        reconnectDelay: 5000,
        onConnect: () => {
          console.log('STOMP Conectado');
          resolve();
        },
        onStompError: (frame) => {
          console.error('STOMP Error', frame);
          reject(frame);
        }
      });

      this.client.activate();
    });

    return this._connectedPromise;
  }

  subscribeToRoom(roomId: string): Observable<ChatMessage> {
    if (!this.roomSubjects.has(roomId)) {
      const subj = new Subject<ChatMessage>();
      this.roomSubjects.set(roomId, subj);

      this.connectIfNeeded(localStorage.getItem('authToken') || '').then(() => {
        if (!this.client) return;

        this.client.subscribe(`/topic/room/${roomId}`, (message: StompMessage) => {
          try {
            const body = JSON.parse(message.body);
            const chatMsg: ChatMessage = {
              id: body.id,
              roomId: body.roomId,
              senderId: body.senderId,
              content: body.content || body.text,
              timestamp: body.timestamp
            };
            subj.next(chatMsg);
          } catch (e) {
            console.error('Error parseando mensaje STOMP', e);
          }
        });
      });
    }
    return this.roomSubjects.get(roomId)!.asObservable();
  }

  sendWsMessage(roomId: string, text: string) {
    if (!this.client || !this.client.active) {
      console.warn('No hay conexión STOMP activa');
      return;
    }
    const payload = { roomId, content: text, pageNumber: 0 };
    this.client.publish({
      destination: `/app/chat.send/${roomId}`,
      body: JSON.stringify(payload)
    });
  }
}
