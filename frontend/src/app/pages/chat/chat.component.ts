import { AuthService } from './../../services/auth.service';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatService, ChatMessage } from '../../services/chat.service';
import { AccountService } from '../../services/account.service';
import { AppNavbarComponent } from '../../components/app-navbar/app-navbar.component';

interface UIConversation {
  roomId: string;
  partnerUsername: string;
  partnerAvatar: string;
  lastMessage: string;
  lastMessageTime: Date | null;
  unreadCount: number;
}

@Component({
  standalone: true,
  selector: 'app-chat',
  imports: [CommonModule, FormsModule, AppNavbarComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  currentUserId: string = '';
  currentUserAvatar: string = '';

  conversations: UIConversation[] = [];
  selectedConversation: UIConversation | null = null;
  messages: ChatMessage[] = [];

  newMessage: string = '';
  searchQuery: string = '';

  isMobile: boolean = false;

  loadingConversations: boolean = true;
  private pollingSub: Subscription | null = null;
  private chatSub: Subscription | null = null;

  constructor(
    private chatService: ChatService,
    private accountService: AccountService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());

    const userId = this.authService.getUserIdFromToken();
    this.currentUserId = userId;
    this.chatService.currentUserId = userId;

    this.accountService.getProfileData().subscribe({
      next: (account: any) => {
        // Asegúrate de usar la propiedad correcta de tu backend para la foto
        this.currentUserAvatar = account.profilePicture || 'assets/default-image.jpg';

        this.loadConversations();

        this.route.queryParams.subscribe((params) => {
          const roomId = params['roomId'];
          if (roomId) {
            this.handleDeepLink(roomId);
          }
        });
      },
      error: (err) => {
        console.error('Error cargando perfil', err);
        // Intentamos cargar conversaciones incluso si falla el perfil
        this.loadConversations();
      },
    });
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
  }

  ngOnDestroy(): void {
    if (this.pollingSub) this.pollingSub.unsubscribe();
    if (this.chatSub) this.chatSub.unsubscribe();
  }

  loadConversations(showLoading = true): void {
    if (showLoading) this.loadingConversations = true;

    this.chatService.getRooms().subscribe({
      next: (dto) => {
        if (!dto || !dto.chatRooms) {
          this.conversations = [];
          this.loadingConversations = false;
          return;
        }

        const mapped: UIConversation[] = dto.chatRooms.map((room, index) => {
          const partnerName = (dto.username && dto.username[index])
            ? dto.username[index]
            : 'Usuario desconocido';

          // Aseguramos que existe el array y el índice antes de acceder
          const partnerPhoto = (dto.partnerAvatar && dto.partnerAvatar[index])
            ? dto.partnerAvatar[index]
            : 'assets/default-image.jpg';

          return {
            roomId: room.id,
            partnerUsername: partnerName,
            partnerAvatar: partnerPhoto,
            lastMessage: room.lastMessagePreview || 'Nueva conversación',
            lastMessageTime: room.lastMessageTime ? new Date(room.lastMessageTime) : null,
            unreadCount: 0,
          };
        });

        // Ordenar por fecha
        mapped.sort((a, b) => {
          const timeA = a.lastMessageTime ? a.lastMessageTime.getTime() : 0;
          const timeB = b.lastMessageTime ? b.lastMessageTime.getTime() : 0;
          return timeB - timeA;
        });

        this.conversations = mapped;
        this.loadingConversations = false;

        // --- CORRECCIÓN CLAVE ---
        // Si tenemos una conversación seleccionada, hay que reconectarla
        // con el nuevo objeto que acaba de llegar del servidor
        if (this.selectedConversation) {
          const updatedConversation = this.conversations.find(
            (c) => c.roomId === this.selectedConversation?.roomId
          );

          if (updatedConversation) {
            // Actualizamos la referencia para que la UI se entere de los cambios (foto, lastMessage, etc)
            this.selectedConversation = updatedConversation;
          }
        }
        // Caso especial: Si venimos de un enlace directo (URL) y aún no habíamos seleccionado nada
        // pero la lista acaba de cargar, intentamos seleccionar automáticamente
        else {
           const urlRoomId = this.route.snapshot.queryParams['roomId'];
           if (urlRoomId) {
             const found = this.conversations.find(c => c.roomId === urlRoomId);
             if (found) {
                // Seleccionamos sin recargar historial si ya lo tenemos
                this.selectedConversation = found;
             }
           }
        }
      },
      error: () => (this.loadingConversations = false),
    });
  }

  handleDeepLink(roomId: string) {
    // Intentamos buscar en la lista actual
    const found = this.conversations.find((c) => c.roomId === roomId);

    if (found) {
      this.selectConversation(found);
    } else {
      // Si no existe (porque la lista no ha cargado aún o es un chat nuevo),
      // creamos un objeto temporal. loadConversations lo actualizará cuando termine.
      const tempConv: UIConversation = {
        roomId: roomId,
        partnerUsername: 'Cargando...',
        partnerAvatar: 'assets/default-image.jpg',
        lastMessage: '',
        lastMessageTime: new Date(),
        unreadCount: 0,
      };

      // Importante: No añadimos tempConv a 'conversations' para no ensuciar la lista,
      // solo lo establecemos como seleccionado.
      this.selectConversation(tempConv);
    }
  }

  selectConversation(conv: UIConversation): void {
    // Evitamos recargar si ya estamos en esa sala
    if (this.selectedConversation?.roomId === conv.roomId && this.messages.length > 0) return;

    this.selectedConversation = conv;
    this.messages = [];

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { roomId: conv.roomId },
      queryParamsHandling: 'merge',
    });

    // 1. Cargar historial
    this.chatService.getHistory(conv.roomId).subscribe({
        next: (msgs) => {
            this.messages = msgs;
            this.scrollToBottom();
        },
        error: (err) => console.error('Error historial', err)
    });

    // 2. Conectar WebSocket
    if (this.chatSub) this.chatSub.unsubscribe();

    this.chatSub = this.chatService
      .subscribeToRoom(conv.roomId)
      .subscribe((msg) => {
        this.messages.push(msg);
        this.scrollToBottom();

        // Actualizar el "último mensaje" en la vista de lista
        // (Esto actualiza la vista lateral en tiempo real)
        if (this.selectedConversation) {
            this.selectedConversation.lastMessage = msg.content;
            this.selectedConversation.lastMessageTime = new Date(msg.timestamp);

            // También actualizamos el objeto dentro del array principal para mantener coherencia
            const inList = this.conversations.find(c => c.roomId === conv.roomId);
            if (inList) {
                inList.lastMessage = msg.content;
                inList.lastMessageTime = new Date(msg.timestamp);

                // Reordenamos la lista para que el chat suba (opcional)
                this.conversations.sort((a, b) => {
                     const tA = a.lastMessageTime?.getTime() || 0;
                     const tB = b.lastMessageTime?.getTime() || 0;
                     return tB - tA;
                });
            }
        }
      });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedConversation) return;

    const text = this.newMessage;
    const roomId = this.selectedConversation.roomId;

    this.chatService.sendWsMessage(roomId, text);
    this.newMessage = '';
  }

  get filteredConversations(): UIConversation[] {
    if (!this.searchQuery) return this.conversations;
    return this.conversations.filter((c) =>
      c.partnerUsername.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop =
          this.scrollContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }
}
