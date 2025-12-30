import { Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { SKIP_LOADING } from '../interceptors/loading.interceptor';

import { Client, Message as StompMessage, Frame } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';

export interface UserBrief { id: string; username: string; fullName?: string; avatarUrl?: string; }
export interface Message { id?: string; senderId: string; text: string; timestamp?: string; }
export interface Conversation { id: string; participants: UserBrief[]; lastMessage?: Message }

export interface ChatRoomDTO {
  id: string;
  participants: string[];
  lastMessagePreview?: string;
  lastMessageTime?: string;
}

export interface SendChatRoomsDTO {
  username: string[];
  chatRooms: ChatRoomDTO[];
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private base = 'http://localhost:8081/api/chat';

  private client: Client | null = null;
  private _connectedResolver: (() => void) | null = null;
  private _connectedRejector: ((err: any) => void) | null = null;
  private _connectedPromise: Promise<void> | null = null;
  private roomSubjects = new Map<string, Subject<Message>>();

  constructor(private http: HttpClient) {}

  // HTTP endpoints (matching backend)
  searchUsers(query: string): Observable<UserBrief[]> {
    // Skip the global loading indicator for every keystroke search
    const ctx = new HttpContext().set(SKIP_LOADING, true);
    return this.http.get<UserBrief[]>(`${this.base}/users?query=${encodeURIComponent(query)}`, { context: ctx });
  }

  getRooms(): Observable<SendChatRoomsDTO> {
    return this.http.get<SendChatRoomsDTO>(`${this.base}/rooms`);
  }

  getHistory(roomId: string, page = 0): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/history/${roomId}?page=${page}`);
  }

  createRoomWithUsername(targetUsername: string): Observable<ChatRoomDTO> {
    return this.http.post<ChatRoomDTO>(`${this.base}/rooms/create/${encodeURIComponent(targetUsername)}`, {});
  }

  markRead(roomId: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.base}/messageReaded/${roomId}`, {});
  }

  // WebSocket / STOMP
  /**
   * Ensure a STOMP connection exists and resolve when connected.
   * Returns a promise that resolves when STOMP is ready.
   */
  connectIfNeeded(authToken?: string): Promise<void> {
    if (this.client && this.client.active) return Promise.resolve();

    const brokerURL = 'http://localhost:8081/ws-chat';
    this.client = new Client({
      webSocketFactory: () => {
        const Sock: any = (SockJS as any).default ?? SockJS as any;
        return new Sock(brokerURL) as any;
      },
      reconnectDelay: 5000,
      debug: (str) => { /* console.debug(str); */ }
    });

    if (authToken) this.client.connectHeaders = { Authorization: `Bearer ${authToken}` } as any;

    // create a new promise for connection state
    this._connectedPromise = new Promise<void>((resolve, reject) => {
      this._connectedResolver = () => resolve();
      this._connectedRejector = (err: any) => reject(err);
    });

    this.client.onConnect = (frame: Frame) => {
      if (this._connectedResolver) this._connectedResolver();
    };

    this.client.onStompError = (frame: any) => {
      if (this._connectedRejector) this._connectedRejector(new Error(frame && frame.body ? frame.body : 'STOMP error'));
    };

    this.client.activate();
    return this._connectedPromise;
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.roomSubjects.clear();
    }
  }

  subscribeToRoom(roomId: string): Observable<Message> {
    let subj = this.roomSubjects.get(roomId);
    if (!subj) {
      subj = new Subject<Message>();
      this.roomSubjects.set(roomId, subj);
      // Ensure connection established before subscribing
      this.connectIfNeeded(localStorage.getItem('authToken') || undefined)
        .then(() => {
          if (!this.client) throw new Error('STOMP client missing after connect');
          this.client.subscribe(`/topic/room/${roomId}`, (m: StompMessage) => {
            try {
              const payload = JSON.parse(m.body);
              const mapped: Message = {
                id: payload.id,
                senderId: payload.senderId,
                text: payload.content || payload.text || '',
                timestamp: payload.timestamp
              };
              subj!.next(mapped);
            } catch (e) { /* ignore parse errors */ }
          });
        })
        .catch(err => {
          // Forward connection errors to subscriber
          subj!.error(err);
        });
    }
    return subj.asObservable();
  }

  sendWsMessage(roomId: string, text: string) {
    if (!this.client) this.connectIfNeeded(localStorage.getItem('authToken') || undefined);
    if (!this.client) return;
    const dto = { roomId, content: text, pageNumber: 0 };
    this.client.publish({ destination: `/app/chat.send/${roomId}`, body: JSON.stringify(dto) });
  }
}
