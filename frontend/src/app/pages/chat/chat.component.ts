import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage, ChatRoom } from '../../services/chat.service'; 
import { AuthService } from '../../services/auth.service'; 
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  standalone: true, 
  imports: [
    CommonModule, 
    FormsModule   
  ]
})
export class ChatComponent implements OnInit, OnDestroy {
  
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  rooms: ChatRoom[] = [];
  selectedRoom: ChatRoom | null = null;
  messages: ChatMessage[] = [];
  
  // Variables para los inputs
  newMessageText: string = '';
  targetUserInput: string = ''; // <--- NUEVA variable para el buscador de usuarios
  
  currentUserId: string = ''; 

  private topicSubscription: any; 
  private msgSubscription: Subscription = new Subscription();

  constructor(
    private chatService: ChatService,
    private authService: AuthService 
  ) {}

  ngOnInit(): void {
    // 1. Obtener ID usuario y Token
    this.currentUserId = this.authService.getUserIdFromToken();
    const token = this.authService.getToken();

    if (!this.currentUserId || !token) {
      console.error("Usuario no identificado. Redirigir a login.");
      return;
    }

    // 2. Conectar al Socket
    this.chatService.connect(token);

    // 3. Cargar salas existentes
    this.loadRooms();

    // 4. Escuchar mensajes entrantes
    this.msgSubscription = this.chatService.onNewMessage().subscribe((msg) => {
      this.handleIncomingMessage(msg);
    });
  }

  /**
   * NUEVA FUNCIÓN: Crea un chat con el usuario que escribas en el input.
   * Si el chat ya existe, simplemente lo abre.
   */
  createChat() {
    const targetId = this.targetUserInput.trim();
    if (!targetId) return;

    // Evitar hablar con uno mismo
    if (targetId === this.currentUserId) {
      alert("No puedes crear un chat contigo mismo.");
      return;
    }

    console.log('Creando/Abriendo chat con:', targetId);

    this.chatService.createRoom(targetId).subscribe({
      next: (room) => {
        console.log('Sala obtenida:', room);
        
        // 1. Limpiamos el input
        this.targetUserInput = '';

        // 2. Comprobamos si la sala ya estaba en nuestra lista local
        const existingIndex = this.rooms.findIndex(r => r.id === room.id);
        
        // Asignamos el nombre visual (el ID del otro usuario) para que se vea bien
        room.chatName = targetId;

        if (existingIndex === -1) {
          // Si es nueva, la añadimos al principio de la lista
          this.rooms.unshift(room);
        } else {
          // Si ya existía, actualizamos los datos
          this.rooms[existingIndex] = room;
        }

        // 3. Abrimos la sala automáticamente para empezar a hablar
        this.selectRoom(room);
      },
      error: (err) => {
        console.error('Error al crear sala:', err);
        alert('Error al conectar. Verifica que el ID del usuario exista.');
      }
    });
  }

  loadRooms() {
    this.chatService.getMyRooms().subscribe({
      next: (data) => {
        this.rooms = data;
        this.rooms.forEach(room => {
          // Calculamos el nombre del chat (el participante que NO soy yo)
          const otherUser = room.participants.find(p => p !== this.currentUserId) || 'Desconocido';
          room.chatName = otherUser;
        });
      },
      error: (err) => console.error('Error cargando salas', err)
    });
  }

  selectRoom(room: ChatRoom) {
    if (this.selectedRoom?.id === room.id) return;

    this.selectedRoom = room;
    this.messages = []; // Limpiar mensajes visualmente mientras cargan los nuevos

    if (this.topicSubscription) {
      this.topicSubscription.unsubscribe();
    }

    // Suscribirse al canal WebSocket de la sala
    this.topicSubscription = this.chatService.joinRoom(room.id);

    // Cargar historial de mensajes (REST)
    this.chatService.getChatHistory(room.id).subscribe(history => {
      // Ordenar por fecha (más antiguo arriba)
      this.messages = history.sort((a, b) => {
        const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return dateA - dateB;
      });
      this.scrollToBottom();
    });
  }

  sendMessage() {
    if (!this.newMessageText.trim() || !this.selectedRoom) return;

    this.chatService.sendMessage(
      this.selectedRoom.id, 
      this.newMessageText, 
      this.currentUserId
    );
    this.newMessageText = '';
  }

  private handleIncomingMessage(msg: ChatMessage) {
    // Si el mensaje pertenece a la sala abierta, lo mostramos
    if (this.selectedRoom && msg.roomId === this.selectedRoom.id) {
      this.messages.push(msg);
      this.scrollToBottom();
    } 
    // Siempre actualizamos la vista previa en la lista lateral
    this.updateRoomListPreview(msg);
  }

  private updateRoomListPreview(msg: ChatMessage) {
    const roomIndex = this.rooms.findIndex(r => r.id === msg.roomId);
    if (roomIndex !== -1) {
      const room = this.rooms[roomIndex];
      room.lastMessagePreview = msg.content;
      room.lastMessageTime = msg.timestamp;
      
      // Mover la sala al inicio de la lista (efecto WhatsApp)
      this.rooms.splice(roomIndex, 1);
      this.rooms.unshift(room);
    }
  }

  private scrollToBottom(): void {
    try {
      setTimeout(() => {
        if (this.scrollContainer) {
          this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
        }
      }, 50);
    } catch (err) { }
  }

  ngOnDestroy(): void {
    if (this.topicSubscription) this.topicSubscription.unsubscribe();
    this.msgSubscription.unsubscribe();
    this.chatService.disconnect();
  }
}