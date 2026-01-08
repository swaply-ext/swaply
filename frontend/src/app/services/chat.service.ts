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

  subscribeToRoom(roomId: string): Observable<ChatMessage> {
    if (!this.roomSubjects.has(roomId)) {
      const subj = new Subject<ChatMessage>();
      this.roomSubjects.set(roomId, subj);

      this.connectIfNeeded(localStorage.getItem('authToken') || '').then(() => {
        if (!this.client) return;

        this.client.subscribe(
          `/topic/room/${roomId}`,
          (message: StompMessage) => {
            try {
              const body = JSON.parse(message.body);
              const chatMsg: ChatMessage = {
                id: body.id,
                roomId: body.roomId,
                senderId: body.senderId,
                content: body.content || body.text,
                timestamp: body.timestamp,
              };
              subj.next(chatMsg);
            } catch (e) {
              // Error de parseo silencioso
            }
          }
        );
      });
    }
    return this.roomSubjects.get(roomId)!.asObservable();
  }

  sendWsMessage(roomId: string, text: string) {
    if (!this.client || !this.client.active) return;

    const payload = { roomId, content: text, pageNumber: 0 };
    this.client.publish({
      destination: `/app/chat.send/${roomId}`,
      body: JSON.stringify(payload),
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
}
