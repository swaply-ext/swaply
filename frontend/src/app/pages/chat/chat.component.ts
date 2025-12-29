import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service'; // Necessari per saber el "meu" ID
import { ChatMessageDTO, ChatRoomViewModel } from '../../models/chat.models';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router'; 

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  chatService = inject(ChatService);
  authService = inject(AuthService);

  // Estat
  rooms: ChatRoomViewModel[] = [];
  selectedRoom: ChatRoomViewModel | null = null;
  messages: ChatMessageDTO[] = [];
  currentUserId: string = '';
  
  // Inputs
  newMessageText: string = '';
  targetUsernameInput: string = '';

  // Subscripcions
  private roomSubscription: any; // STOMP subscription
  private msgSubscription: Subscription = new Subscription();
  private route = inject(ActivatedRoute); 

  ngOnInit(): void {
    // 1. Identificar l'usuari actual (per saber quins missatges són "meus")
    // (Assumeixo que tens un mètode així al authService, si no, caldrà crear-lo)
    this.currentUserId = this.authService.getUserIdFromToken() || ''; 

    if (!this.currentUserId) {
      console.error('Usuario no autenticado. No se puede iniciar el chat.');
      return;
    }

    // 2. Connectar al Socket
    this.chatService.connect();

    // 3. Carregar la llista de xats
    this.loadRoomsAndSelect();
    // 4. Escoltar nous missatges globals (per actualitzar llista o xat obert)
    this.msgSubscription = this.chatService.onNewMessage$.subscribe((msg) => {
      this.handleIncomingMessage(msg);
    });
  }

loadRoomsAndSelect() {
    this.chatService.getMyRooms().subscribe({
      next: (data) => {
        this.rooms = data; // (Ja ve mapejat del servei com a ViewModel)
        
        // 4. MÀGIA: Mirem si hem de obrir una sala específica
        this.route.queryParams.subscribe(params => {
          const roomIdToOpen = params['roomId'];
          if (roomIdToOpen) {
            const targetRoom = this.rooms.find(r => r.id === roomIdToOpen);
            if (targetRoom) {
              this.selectRoom(targetRoom);
            }
          }
        });
      },
      error: (err) => console.error('Error cargando salas', err)
    });
  }

  selectRoom(room: ChatRoomViewModel) {
    if (this.selectedRoom?.id === room.id) return; // Ja estem aquí

    this.selectedRoom = room;
    this.messages = []; // Netejar vista mentre carrega

    // 1. Gestionar subscripció al socket
    if (this.roomSubscription) {
      this.roomSubscription.unsubscribe(); // Deixar d'escoltar la sala anterior
    }
    this.roomSubscription = this.chatService.joinRoom(room.id);

    // 2. Carregar historial
    this.chatService.getChatHistory(room.id).subscribe({
      next: (history) => {
        this.messages = history; // Assumeixo que el backend ja els envia ordenats, si no: .sort()
        this.scrollToBottom();
      }
    });
  }

  sendMessage() {
    if (!this.newMessageText.trim() || !this.selectedRoom) return;

    this.chatService.sendMessage(
      this.selectedRoom.id,
      this.newMessageText,
      this.currentUserId
    );
    this.newMessageText = ''; // Netejar input
  }

  createChat() {
    // Aquí implementaries la lògica de crear sala per username
    // Potser necessites primer buscar l'ID de l'usuari a partir del username
    // o el backend ja accepta username.
    console.log('Crear xat amb:', this.targetUsernameInput);
  }

  // --- LÒGICA INTERNA ---

  private handleIncomingMessage(msg: ChatMessageDTO) {
    // 1. Si és de la sala oberta, l'afegim a la llista visual
    if (this.selectedRoom && msg.roomId === this.selectedRoom.id) {
      this.messages.push(msg);
      this.scrollToBottom();
    }

    // 2. Actualitzar la vista prèvia a la llista de l'esquerra (efecte WhatsApp)
    const roomIndex = this.rooms.findIndex(r => r.id === msg.roomId);
    if (roomIndex !== -1) {
      const room = this.rooms[roomIndex];
      room.lastMessagePreview = msg.content;
      room.lastMessageTime = msg.timestamp;
      
      // Moure a dalt de tot
      this.rooms.splice(roomIndex, 1);
      this.rooms.unshift(room);
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    }, 50);
  }

  ngOnDestroy(): void {
    this.msgSubscription.unsubscribe();
    if (this.roomSubscription) this.roomSubscription.unsubscribe();
    this.chatService.disconnect();
  }
}