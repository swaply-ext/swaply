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
        animate('300ms cubic-bezier(0.25, 0.8, 0.25, 1)',
          style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ])
    ])
  ]
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

  private updatesSub: Subscription | null = null;
  private chatSub: Subscription | null = null;
  private activeRoomSub: Subscription | null = null;

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
        this.currentUserAvatar = account.profilePicture || 'assets/default-image.jpg';
        this.loadConversations();

        // Suscripción a actualizaciones globales (nuevos chats o avisos del servidor)
        this.updatesSub = this.chatService.subscribeToUserUpdates(userId).subscribe(() => {
          this.loadConversations(false);
        });

        this.activeRoomSub = this.chatService.activeRoom$.subscribe(roomId => {
          if (roomId) this.handleDeepLink(roomId);
        });

        const urlRoomId = this.route.snapshot.queryParamMap.get('roomId');
        if (urlRoomId) {
          this.chatService.setActiveRoom(urlRoomId);
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { roomId: null },
            queryParamsHandling: 'merge',
            replaceUrl: true
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
          const partnerName = (dto.username && dto.username[index])
            ? dto.username[index]
            : 'Usuario desconocido';

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

        mapped.sort((a, b) => {
          const timeA = a.lastMessageTime ? a.lastMessageTime.getTime() : 0;
          const timeB = b.lastMessageTime ? b.lastMessageTime.getTime() : 0;
          return timeB - timeA;
        });

        this.conversations = mapped;
        this.loadingConversations = false;

        if (this.selectedConversation) {
          const updatedConversation = this.conversations.find(
            (c) => c.roomId === this.selectedConversation?.roomId
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

  selectConversation(conv: UIConversation, updateService: boolean = true): void {
    if (this.selectedConversation?.roomId === conv.roomId && this.messages.length > 0) return;

    this.selectedConversation = conv;
    this.messages = [];

    if (updateService) {
      this.chatService.setActiveRoom(conv.roomId);
      return;
    }

    this.chatService.getHistory(conv.roomId).subscribe({
      next: (msgs) => {
        this.messages = msgs;
        this.scrollToBottom();
      },
      error: () => { /* Silenciar error en UI */ }
    });

    if (this.chatSub) this.chatSub.unsubscribe();

    this.chatSub = this.chatService
      .subscribeToRoom(conv.roomId)
      .subscribe((msg) => {
        this.messages.push(msg);
        this.scrollToBottom();

        if (this.selectedConversation) {
          this.selectedConversation.lastMessage = msg.content;
          this.selectedConversation.lastMessageTime = new Date(msg.timestamp);

          const inList = this.conversations.find(c => c.roomId === conv.roomId);
          if (inList) {
            inList.lastMessage = msg.content;
            inList.lastMessageTime = new Date(msg.timestamp);
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
