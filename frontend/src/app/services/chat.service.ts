import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private stompClient: Client;
  private serverUrl = 'http://localhost:8080/ws-chat'; // Tu URL del Backend
  
  // Usamos BehaviorSubject para saber si estamos conectados
  private connectionState = new BehaviorSubject<boolean>(false);
  public connectionState$ = this.connectionState.asObservable();

  constructor() {
    this.stompClient = new Client({
      // Como el backend usa .withSockJS(), necesitamos esta fábrica:
      webSocketFactory: () => new SockJS(this.serverUrl),
      
      // Opciones de reconexión automática
      reconnectDelay: 5000, 
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.configureLifecycleLogs();
  }

  /**
   * Conecta al WebSocket enviando el token JWT
   * @param token El token JWT del usuario logueado
   */
  public connect(token: string): void {
    // Configuramos las cabeceras de conexión con el Token
    this.stompClient.connectHeaders = {
      Authorization: `Bearer ${token}`
    };

    // Callback cuando conecta exitosamente
    this.stompClient.onConnect = (frame) => {
      console.log('Conectado al WebSocket: ' + frame);
      this.connectionState.next(true);

      // Aquí podrías suscribirte automáticamente a canales globales si quisieras
    };

    // Callback de error
    this.stompClient.onStompError = (frame) => {
      console.error('Error en Broker: ' + frame.headers['message']);
      console.error('Detalles: ' + frame.body);
      this.connectionState.next(false);
    };

    // Iniciar conexión
    this.stompClient.activate();
  }

  /**
   * Se desconecta limpiamente
   */
  public disconnect(): void {
    if (this.stompClient.active) {
      this.stompClient.deactivate();
      this.connectionState.next(false);
      console.log('Desconectado del WebSocket');
    }
  }

  /**
   * Envía un mensaje al backend
   * @param destination Ej: "/app/chat"
   * @param body El objeto mensaje (se convierte a JSON automáticamente)
   */
  public sendMessage(destination: string, body: any): void {
    if (this.stompClient.connected) {
      this.stompClient.publish({
        destination: destination,
        body: JSON.stringify(body)
      });
    } else {
      console.warn('No se puede enviar mensaje, WebSocket desconectado.');
    }
  }

  /**
   * Se suscribe a un tópico para recibir mensajes
   * Retorna un Observable para usarlo en el componente con .subscribe()
   * @param topic Ej: "/topic/messages"
   */
  public subscribeToTopic(topic: string): Observable<any> {
    return new Observable((observer) => {
      // Esperamos a que el cliente esté conectado antes de suscribir
      if (!this.stompClient.connected) {
        observer.error('Cliente no conectado');
        return;
      }

      const subscription = this.stompClient.subscribe(topic, (message: Message) => {
        // Parseamos el cuerpo del mensaje
        if (message.body) {
          observer.next(JSON.parse(message.body));
        }
      });

      // Lógica de limpieza cuando el componente Angular se destruye
      return () => {
        subscription.unsubscribe();
      };
    });
  }

  private configureLifecycleLogs() {
    this.stompClient.debug = (str) => {
      // Descomenta esto si quieres ver todos los logs del socket en consola
      // console.log(new Date(), str);
    };
  }
}