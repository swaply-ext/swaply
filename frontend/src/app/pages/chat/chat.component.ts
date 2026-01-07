import { Component, OnInit, OnDestroy, ViewChild, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
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
  imports: [
    CommonModule, 
    FormsModule,
    AppNavbarComponent
    ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
    
    this.accountService.getProfileData().subscribe({
      next: (profile: any) => {
        this.currentUserId = profile.username; 
        this.currentUserAvatar = profile.profilePicture || 'assets/default-image.jpg';
        
        this.loadConversations();

        this.route.queryParams.subscribe(params => {
          const roomId = params['roomId'];
          if (roomId) {
            this.handleDeepLink(roomId);
          }
        });

        this.pollingSub = interval(1000000).subscribe(() => {
          this.loadConversations(false);
        });
      },
      error: (err) => console.error('Error cargando perfil', err)
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
        if (!dto.chatRooms || !dto.username || dto.profilePhotos) {
          this.conversations = [];
          this.loadingConversations = false;
          return;
        }

        const mapped: UIConversation[] = dto.chatRooms.map((room, index) => {
          const partnerName = dto.username[index] || 'Usuario desconocido';
          const existing = this.conversations.find(c => c.roomId === room.id);
          
          return {
            roomId: room.id,
            partnerUsername: partnerName,
            partnerAvatar: existing ? existing.partnerAvatar : 'assets/default-image.jpg', 
            lastMessage: room.lastMessagePreview || 'Nueva conversación',
            lastMessageTime: room.lastMessageTime ? new Date(room.lastMessageTime) : null,
            unreadCount: 0 
          };
        });

        mapped.sort((a, b) => {
          const timeA = a.lastMessageTime ? a.lastMessageTime.getTime() : 0;
          const timeB = b.lastMessageTime ? b.lastMessageTime.getTime() : 0;
          return timeB - timeA;
        });

        this.conversations = mapped;
        this.loadingConversations = false;

        this.fetchAvatarsForConversations();
        
        if (this.selectedConversation) {
        }
      },
      error: () => this.loadingConversations = false
    });
  }

  fetchAvatarsForConversations() {
    this.conversations.forEach(conv => {
      if (conv.partnerAvatar === 'assets/default-image.jpg') {
        this.accountService.getPublicProfile(conv.partnerUsername).subscribe({
          next: (profile: any) => {
            if (profile && profile.profilePicture) {
              conv.partnerAvatar = profile.profilePicture;
            }
          },
          error: () => {} 
        });
      }
    });
  }

  handleDeepLink(roomId: string) {
    const found = this.conversations.find(c => c.roomId === roomId);
    if (found) {
      this.selectConversation(found);
    } else {
      const tempConv: UIConversation = {
        roomId: roomId,
        partnerUsername: 'Cargando...', 
        partnerAvatar: 'assets/default-image.jpg',
        lastMessage: '',
        lastMessageTime: new Date(),
        unreadCount: 0
      };
      this.selectConversation(tempConv);
    }
  }

  selectConversation(conv: UIConversation): void {
    if (this.selectedConversation?.roomId === conv.roomId) return;

    this.selectedConversation = conv;
    this.messages = [];

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { roomId: conv.roomId },
      queryParamsHandling: 'merge'
    });

    this.chatService.getHistory(conv.roomId).subscribe(msgs => {
        this.messages = msgs;
        this.scrollToBottom();
    });

    if (this.chatSub) this.chatSub.unsubscribe();
    
    this.chatSub = this.chatService.subscribeToRoom(conv.roomId).subscribe((msg) => {
      this.messages.push(msg);
      this.scrollToBottom();
      
      conv.lastMessage = msg.content;
      conv.lastMessageTime = new Date(msg.timestamp);
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
    return this.conversations.filter(c => 
      c.partnerUsername.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }
}
