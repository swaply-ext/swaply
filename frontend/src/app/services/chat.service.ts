//servicio del chat gestiona la conexion STOMP, y mapea los DTOs a modelos de vista
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service'; // Assegura't de tenir aquest servei
import { ChatMessageDTO, ChatRoomDTO, ChatRoomViewModel, SendChatRoomsDTO } from '../models/chat.models';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private stompClient: Client | null = null;
  
  private readonly API_URL = 'http://localhost:8081/api/chat'; 
  private readonly SOCKET_URL = 'http://localhost:8081/ws-chat'; // Ruta definida al WebSocketConfig de Java

  // Observables per als components
  private messageSubject = new Subject<ChatMessageDTO>();
  public onNewMessage$ = this.messageSubject.asObservable();

  private connectionStateSubject = new BehaviorSubject<boolean>(false);
  public isConnected$ = this.connectionStateSubject.asObservable();

  constructor() {}

  // --- REST METHODS ---

  //transforma SendChatRoomsDTO en ChatRoomViewModel[] de la recepciónd e backend para poder meterlo en la vista de frontend
  getMyRooms(): Observable<ChatRoomViewModel[]> {
    return this.http.get<SendChatRoomsDTO>(`${this.API_URL}/rooms`).pipe(
      map((response: SendChatRoomsDTO) => {
        //mapping para unir 2 listas
        return response.chatRooms.map((room, index) => {
          const name = response.username[index] || 'Usuario Desconocido';
          return {
            ...room,
            displayUsername: name,
            displayAvatar: 'assets/default-avatar.png' 
          } as ChatRoomViewModel;
        });
      })
    );
  }

  getChatHistory(roomId: string): Observable<ChatMessageDTO[]> {
    return this.http.get<ChatMessageDTO[]>(`${this.API_URL}/history/${roomId}`);
  }

  createRoom(targetUserId: string): Observable<ChatRoomDTO> {
    return this.http.post<ChatRoomDTO>(`${this.API_URL}/rooms/create/${targetUserId}`, {});
  }

  //WEBSOCKET METHOD

  connect() {
    const token = this.authService.getToken(); //conexion con el token de authservice
    if (!token) {
      console.error('No existe el token, no se puede conectar al WebSocket (no se crea la conexion)');
      return;
    }

    //Cliente stomp
    this.stompClient = new Client({
      //funcion default de SockJS
      webSocketFactory: () => new SockJS(this.SOCKET_URL),
      
      //HEADER de autenticacion para el interceptor WebSocket de Hava, ahí se captura el token
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      
      debug: (str) => console.log('[WS Debug]:', str),
      reconnectDelay: 5000, //Reconnectar
    });

    this.stompClient.onConnect = (frame) => {
      console.log('Connectat al Broker STOMP');
      this.connectionStateSubject.next(true);
    };

    this.stompClient.onStompError = (frame) => {
      console.error('Error al Broker:', frame.headers['message']);
      console.error('Detalls:', frame.body);
    };

    this.stompClient.activate();
  }

  //iniciar una sala especifica 
  joinRoom(roomId: string) {
    if (this.stompClient && this.stompClient.connected) {
      console.log(`Subscrivint a /topic/room/${roomId}`);
      return this.stompClient.subscribe(`/topic/room/${roomId}`, (message: Message) => {
        const parsedMessage: ChatMessageDTO = JSON.parse(message.body);
        this.messageSubject.next(parsedMessage);
      });
    } else {
      console.warn('No es pot subscriure: Client no connectat');
      return null;
    }
  }

  sendMessage(roomId: string, content: string, senderId: string) {
    if (this.stompClient && this.stompClient.connected) {
      const chatMessage: ChatMessageDTO = {
        roomId: roomId,
        content: content,
        senderId: senderId
      };

      this.stompClient.publish({
        destination: `/app/chat.send/${roomId}`, //coincide con @MessageMapping de Java
        body: JSON.stringify(chatMessage)
      });
    } else {
      console.error('No es pot enviar: Client no connectat');
    }
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.connectionStateSubject.next(false);
    }
  }
}