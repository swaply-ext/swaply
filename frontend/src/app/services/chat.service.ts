import { Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
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

@Injectable({ providedIn: 'root' })
export class ChatService {
  private base = 'http://localhost:8081/api/chat';
  private client: Client | null = null;
  private roomSubjects = new Map<string, Subject<ChatMessage>>();
  public currentUserId: string = '';

  private activeRoomSource = new BehaviorSubject<string | null>(null);
  public activeRoom$ = this.activeRoomSource.asObservable();
  private _connectedPromise: Promise<void> | null = null;

  constructor(private http: HttpClient) {}

  public setActiveRoom(roomId: string | null) {
    this.activeRoomSource.next(roomId);
  }

  getRooms(): Observable<SendChatRoomsDTO> {
    return this.http.get<SendChatRoomsDTO>(`${this.base}/rooms`, {
      context: new HttpContext().set(SKIP_LOADING, true),
    });
  }

  getHistory(roomId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.base}/history/${roomId}`, {
      context: new HttpContext().set(SKIP_LOADING, true),
    });
  }

  createRoomWithUsername(targetUsername: string): Observable<ChatRoomDTO> {
    return this.http.post<ChatRoomDTO>(
      `${this.base}/rooms/create/${targetUsername}`,
      {}
    );
  }

  async connectIfNeeded(authToken?: string): Promise<void> {
    if (this.client && this.client.active) return;
    if (this._connectedPromise) return this._connectedPromise;

    this._connectedPromise = new Promise((resolve, reject) => {
      const factory = () => new SockJS('http://localhost:8081/ws-chat');

      this.client = new Client({
        webSocketFactory: factory,
        connectHeaders: {
          Authorization: `Bearer ${authToken}`,
        },
        reconnectDelay: 5000,
        onConnect: () => {
          resolve();
        },
        onStompError: (frame) => {
          reject(frame);
        },
      });

      this.client.activate();
    });

    return this._connectedPromise;
  }

  // Reemplaza el método subscribeToRoom por este:

  subscribeToRoom(roomId: string): Observable<ChatMessage> {
    return new Observable<ChatMessage>((observer) => {
      // 1. Asegurar conexión
      this.connectIfNeeded(localStorage.getItem('authToken') || '')
        .then(() => {
          if (!this.client || !this.client.active) {
            observer.error('No se pudo conectar al WebSocket');
            return;
          }

          // 2. Suscribirse al canal específico de STOMP
          const subscription = this.client.subscribe(
            `/topic/room/${roomId}`,
            (message: StompMessage) => {
              try {
                const body = JSON.parse(message.body);
                // Aseguramos que el timestamp sea compatible
                const chatMsg: ChatMessage = {
                  id: body.id,
                  roomId: body.roomId,
                  senderId: body.senderId,
                  content: body.content || body.text, // Manejo de fallback
                  timestamp: body.timestamp,
                };
                observer.next(chatMsg);
              } catch (e) {
                console.error('Error parseando mensaje', e);
              }
            }
          );

          // 3. Lógica de limpieza (Teardown logic)
          // Esto se ejecuta automáticamente cuando el componente Angular se destruye
          // o llamas a .unsubscribe()
          return () => {
            if (subscription) {
              subscription.unsubscribe();
            }
          };
        })
        .catch((err) => observer.error(err));
    });
  }

  subscribeToUserUpdates(userId: string): Observable<string> {
    const subj = new Subject<string>();
    const destination = `/topic/user/${userId}/updates`;

    this.connectIfNeeded(localStorage.getItem('authToken') || '').then(() => {
      if (!this.client) return;

      this.client.subscribe(destination, (message: StompMessage) => {
        subj.next(message.body);
      });
    });

    return subj.asObservable();
  }

  sendWsMessage(roomId: string, content: string): void {
    // 1. Verificación de seguridad
    if (!this.client || !this.client.active) {
      console.warn('⚠️ No se puede enviar: WebSocket desconectado.');
      return;
    }

    // 2. Construcción del payload
    // Es importante enviar el senderId si tu backend no lo extrae automáticamente del token
    const payload = {
      roomId: roomId,
      content: content,
      senderId: this.currentUserId, // Asegúrate de que esta variable tenga valor al hacer login
      timestamp: new Date().toISOString()
    };

    // 3. Envío al Backend
    // Esto debe coincidir con el @MessageMapping("/chat.send/{roomId}") de tu Controller Java
    this.client.publish({
      destination: `/app/chat.send/${roomId}`,
      body: JSON.stringify(payload),
    });
  }
}
