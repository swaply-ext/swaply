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

  // Variables para la paginación
  nextContinuationToken: string | null = null;
  isLastPage: boolean = false;
  isLoadingHistory: boolean = false;

  private updatesSub: Subscription | null = null;
  private chatSub: Subscription | null = null;
  private activeRoomSub: Subscription | null = null;

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

        this.activeRoomSub = this.chatService.activeRoom$.subscribe(
          (roomId) => {
            if (roomId) this.handleDeepLink(roomId);
          },
        );

        const urlRoomId = this.route.snapshot.queryParamMap.get('roomId');
        if (urlRoomId) {
          this.chatService.setActiveRoom(urlRoomId);
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { roomId: null },
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
        }
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

          return {
            roomId: room.id,
            partnerUsername: partnerName,
            partnerAvatar: partnerPhoto,
            lastMessage: room.lastMessagePreview || 'Nueva conversación',
            lastMessageTime: room.lastMessageTime
              ? new Date(room.lastMessageTime)
              : null,
            unreadCount: 0,
          };
        });

        this.sortConversations(mapped);
        this.conversations = mapped;
        this.loadingConversations = false;

        if (this.selectedConversation) {
          const updatedConversation = this.conversations.find(
            (c) => c.roomId === this.selectedConversation?.roomId,
          );
          if (updatedConversation) {
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
    if (
      this.selectedConversation?.roomId === conv.roomId &&
      this.messages.length > 0
    )
      return;

    this.selectedConversation = conv;
    this.messages = [];

    // RESETEAR TOKEN
    this.nextContinuationToken = null;
    this.isLastPage = false;
    this.isLoadingHistory = false;

    if (updateService) {
      this.chatService.setActiveRoom(conv.roomId);
      return;
    }

    this.isLoadingHistory = true;

    // Primera llamada: Token es null
    this.chatService.getHistory(conv.roomId, null).subscribe({
      next: (response) => {
        // Ordenar y asignar mensajes
        this.messages = (response.messages || []).sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        );

        // GUARDAR EL TOKEN PARA LA SIGUIENTE VEZ
        this.nextContinuationToken = response.continuationToken;

        // Si no hay token, es la última página
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

    if (this.chatSub) this.chatSub.unsubscribe();

    this.chatSub = this.chatService
      .subscribeToRoom(conv.roomId)
      .subscribe((msg) => {
        this.messages.push(msg);
        this.scrollToBottom();
        this.updateConversationListOnNewMessage(conv.roomId, msg);
      });
  }

  // --- NUEVA LÓGICA DE SCROLL ---
  onScroll(): void {
    if (this.isLoadingHistory || this.isLastPage || !this.selectedConversation)
      return;

    const element = this.scrollContainer.nativeElement;

    // Si el usuario llega al tope (scrollTop == 0) cargamos más
    if (element.scrollTop === 0) {
      this.loadMoreMessages();
    }
  }

  loadMoreMessages(): void {
    if (!this.selectedConversation || this.isLastPage || !this.nextContinuationToken) return;

    this.isLoadingHistory = true;
    const currentRoomId = this.selectedConversation.roomId;

    // USAR EL TOKEN GUARDADO
    this.chatService.getHistory(currentRoomId, this.nextContinuationToken).subscribe({
      next: (response) => {
        const oldMessages = response.messages;

        if (!oldMessages || oldMessages.length === 0) {
          this.isLastPage = true;
          this.isLoadingHistory = false;
          return;
        }

        // Actualizar el token con el nuevo que nos dio el backend
        this.nextContinuationToken = response.continuationToken;
        if (!this.nextContinuationToken) {
           this.isLastPage = true;
        }

        oldMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        const element = this.scrollContainer.nativeElement;
        const oldScrollHeight = element.scrollHeight;

        this.messages = [...oldMessages, ...this.messages];

        setTimeout(() => {
          const newScrollHeight = element.scrollHeight;
          element.scrollTop = newScrollHeight - oldScrollHeight;
          this.isLoadingHistory = false;
        }, 0);
      },
      error: () => {
        this.isLoadingHistory = false;
        // No borramos el token si falla, para que el usuario pueda reintentar
      }
    });
  }
  // ------------------------------

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
