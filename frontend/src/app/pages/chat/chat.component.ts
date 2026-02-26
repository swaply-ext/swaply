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
import { trigger, style, animate, transition } from '@angular/animations';

interface UIConversation {
  roomId: string;
  partnerUsername: string;
  partnerAvatar: string;
  lastMessage?: string;
  lastMessageTime: Date | null;
  unreadCount: number;
}

@Component({
  standalone: true,
  selector: 'app-chat',
  imports: [CommonModule, FormsModule, AppNavbarComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  animations: [
    trigger('messageAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px) scale(0.95)' }),
        animate(
          '300ms cubic-bezier(0.25, 0.8, 0.25, 1)',
          style({ opacity: 1, transform: 'translateY(0) scale(1)' }),
        ),
      ]),
    ]),
  ],
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

  nextContinuationToken: string | null = null;
  isLastPage: boolean = false;
  isLoadingHistory: boolean = false;

  private updatesSub: Subscription | null = null;
  private chatSub: Subscription | null = null;
  private activeRoomSub: Subscription | null = null;
  private routeSub: Subscription | null = null;

  constructor(
    private chatService: ChatService,
    private accountService: AccountService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());

    const userId = this.authService.getUserIdFromToken();
    this.currentUserId = userId;
    this.chatService.currentUserId = userId;

    this.accountService.getProfileData().subscribe({
      next: (account: any) => {
        this.currentUserAvatar =
          account.profilePicture || 'assets/default-image.jpg';
        this.loadConversations();

        this.updatesSub = this.chatService
          .subscribeToUserUpdates(userId)
          .subscribe(() => {
            this.loadConversations(false);
          });

        // Suscripción a la sala activa (fuente de la verdad)
        this.activeRoomSub = this.chatService.activeRoom$.subscribe(
          (roomId) => {
            if (roomId) {
              this.handleDeepLink(roomId);
            } else {
              // Si no hay sala (ej. usuario se desconecta o sale), limpiamos
              this.clearChatView();
            }
          },
        );

        // Suscripción a cambios en la URL (para detectar navegación atrás/adelante o enlaces directos)
        this.routeSub = this.route.queryParamMap.subscribe((params) => {
          const urlRoomId = params.get('roomId');
          if (urlRoomId && this.selectedConversation?.roomId !== urlRoomId) {
            this.chatService.setActiveRoom(urlRoomId);
            // Limpiamos la URL para que no quede "sucia", pero mantenemos el estado
            this.router.navigate([], {
              relativeTo: this.route,
              queryParams: { roomId: null },
              queryParamsHandling: 'merge',
              replaceUrl: true,
            });
          }
        });
      },
      error: () => {
        this.loadConversations();
      },
    });
  }

  ngOnDestroy(): void {
    if (this.updatesSub) this.updatesSub.unsubscribe();
    if (this.chatSub) this.chatSub.unsubscribe();
    if (this.activeRoomSub) this.activeRoomSub.unsubscribe();
    if (this.routeSub) this.routeSub.unsubscribe();
    window.removeEventListener('resize', () => this.checkScreenSize());
  }

  // Método auxiliar para resetear la vista del chat
  private clearChatView() {
    this.selectedConversation = null;
    this.messages = [];
    this.newMessage = '';
    this.nextContinuationToken = null;
    this.isLastPage = false;
    if (this.chatSub) {
      this.chatSub.unsubscribe();
      this.chatSub = null;
    }
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
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
          const partnerName =
            dto.username && dto.username[index]
              ? dto.username[index]
              : 'Usuario desconocido';

          const partnerPhoto =
            dto.partnerAvatar && dto.partnerAvatar[index]
              ? dto.partnerAvatar[index]
              : 'assets/default-image.jpg';

          const isCurrentRoom = this.selectedConversation?.roomId === room.id;

          let myUnreadCount = 0;
          const unreadObj = (room as any).unreadCount;

          if (unreadObj && this.currentUserId) {
            myUnreadCount = unreadObj[this.currentUserId] || 0;
          }

          return {
            roomId: room.id,
            partnerUsername: partnerName,
            partnerAvatar: partnerPhoto,
            lastMessage: room.lastMessagePreview || 'Nueva conversación',
            lastMessageTime: room.lastMessageTime
              ? new Date(room.lastMessageTime)
              : null,
            unreadCount: isCurrentRoom ? 0 : myUnreadCount,
          };
        });

        this.sortConversations(mapped);
        this.conversations = mapped;
        this.loadingConversations = false;

        // Actualizamos referencia visual si la conversación seleccionada está en la lista
        if (this.selectedConversation) {
          const updatedConversation = this.conversations.find(
            (c) => c.roomId === this.selectedConversation?.roomId,
          );
          if (updatedConversation) {
             // Preservamos el estado local (como unreadCount a 0)
             updatedConversation.unreadCount = 0;
             this.selectedConversation = updatedConversation;
          }
        }
      },
      error: () => (this.loadingConversations = false),
    });
  }

  handleDeepLink(roomId: string) {
    const found = this.conversations.find((c) => c.roomId === roomId);

    if (found) {
      this.selectConversation(found, false);
    } else {
      // Si no está en la lista (chat nuevo o lista no cargada aún), creamos uno temporal
      const tempConv: UIConversation = {
        roomId: roomId,
        partnerUsername: 'Cargando...',
        partnerAvatar: 'assets/default-image.jpg',
        lastMessage: '',
        lastMessageTime: new Date(),
        unreadCount: 0,
      };
      this.selectConversation(tempConv, false);
    }
  }

  selectConversation(
    conv: UIConversation,
    updateService: boolean = true,
  ): void {
    // 1. Si es una acción del usuario (click), solo actualizamos el servicio.
    // NO cambiamos this.selectedConversation aquí todavía.
    // Dejamos que activeRoomSub capture el cambio y llame de nuevo con updateService=false.
    if (updateService) {
      this.chatService.setActiveRoom(conv.roomId);
      return;
    }

    // --- A partir de aquí updateService es FALSE (llamada desde suscripción) ---

    // 2. Evitar recargar si ya estamos en la misma sala Y ya tenemos mensajes cargados
    if (
      this.selectedConversation?.roomId === conv.roomId &&
      this.messages.length > 0
    ) {
      return;
    }

    // 3. Preparar la vista para la nueva conversación
    this.messages = []; // Limpiamos mensajes anteriores inmediatamente
    this.nextContinuationToken = null;
    this.isLastPage = false;
    this.isLoadingHistory = false;

    conv.unreadCount = 0;
    this.selectedConversation = conv; // Aquí es donde finalmente establecemos la conversación

    // 4. Cargar historial
    this.isLoadingHistory = true;

    this.chatService.getHistory(conv.roomId, null).subscribe({
      next: (response) => {
        // Verificación de seguridad: si el usuario cambió de sala mientras cargaba, ignoramos esto
        if (this.selectedConversation?.roomId !== conv.roomId) return;

        this.messages = (response.messages || []).sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        );

        this.nextContinuationToken = response.continuationToken;

        if (!this.nextContinuationToken || response.messages.length === 0) {
          this.isLastPage = true;
        }

        this.isLoadingHistory = false;
        this.scrollToBottom();
      },
      error: () => {
        this.isLoadingHistory = false;
      },
    });

    // 5. Suscribirse a mensajes en tiempo real
    if (this.chatSub) this.chatSub.unsubscribe();

    this.chatSub = this.chatService
      .subscribeToRoom(conv.roomId)
      .subscribe((msg) => {
        // Solo añadir si seguimos en la misma sala
        if (this.selectedConversation?.roomId === conv.roomId) {
          this.messages.push(msg);
          this.scrollToBottom();
          this.updateConversationListOnNewMessage(conv.roomId, msg);
        }
      });
  }

  onScroll(): void {
    if (this.isLoadingHistory || this.isLastPage || !this.selectedConversation)
      return;

    const element = this.scrollContainer.nativeElement;

    if (element.scrollTop === 0) {
      this.loadMoreMessages();
    }
  }

  loadMoreMessages(): void {
    if (!this.selectedConversation || this.isLastPage || !this.nextContinuationToken) return;

    this.isLoadingHistory = true;
    const currentRoomId = this.selectedConversation.roomId;

    this.chatService.getHistory(currentRoomId, this.nextContinuationToken).subscribe({
      next: (response) => {
        if (this.selectedConversation?.roomId !== currentRoomId) return;

        const oldMessages = response.messages;

        if (!oldMessages || oldMessages.length === 0) {
          this.isLastPage = true;
          this.isLoadingHistory = false;
          return;
        }

        this.nextContinuationToken = response.continuationToken;
        if (!this.nextContinuationToken) {
           this.isLastPage = true;
        }

        oldMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        const element = this.scrollContainer.nativeElement;
        const oldScrollHeight = element.scrollHeight;

        // Añadimos al principio
        this.messages = [...oldMessages, ...this.messages];

        setTimeout(() => {
          const newScrollHeight = element.scrollHeight;
          element.scrollTop = newScrollHeight - oldScrollHeight;
          this.isLoadingHistory = false;
        }, 0);
      },
      error: () => {
        this.isLoadingHistory = false;
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
      c.partnerUsername.toLowerCase().includes(this.searchQuery.toLowerCase()),
    );
  }

  private sortConversations(list: UIConversation[]) {
    list.sort((a, b) => {
      const timeA = a.lastMessageTime ? a.lastMessageTime.getTime() : 0;
      const timeB = b.lastMessageTime ? b.lastMessageTime.getTime() : 0;
      return timeB - timeA;
    });
  }

  private updateConversationListOnNewMessage(roomId: string, msg: ChatMessage) {
    if (
      this.selectedConversation &&
      this.selectedConversation.roomId === roomId
    ) {
      this.selectedConversation.lastMessage = msg.content;
      this.selectedConversation.lastMessageTime = new Date(msg.timestamp);
    }

    const inListIndex = this.conversations.findIndex(
      (c) => c.roomId === roomId,
    );
    if (inListIndex > -1) {
      const conversation = this.conversations[inListIndex];
      conversation.lastMessage = msg.content;
      conversation.lastMessageTime = new Date(msg.timestamp);

      this.conversations.splice(inListIndex, 1);
      this.conversations.unshift(conversation);
    }
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
