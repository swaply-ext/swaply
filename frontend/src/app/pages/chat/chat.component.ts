import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, UserBrief, Message } from '../../services/chat.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../services/account.service';

@Component({
  standalone: true,
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.clean.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  searchQuery = '';
  users: UserBrief[] = [];
  conversations: any[] = [];
  selectedConversation: any | null = null;
  messages: Message[] = [];
  newMessage = '';

  loadingConversations = false;

  currentUserId: string | null = null;
  currentUserAvatar: string | null = null;

  private roomSub: any;
  private refreshIntervalId: any = null;

  constructor(private chat: ChatService, private route: ActivatedRoute, private router: Router, private accountService: AccountService) {}

  ngOnInit(): void {
    // Load current profile first (to determine "me" id and avatar)
    this.accountService.getProfileData().subscribe({
      next: (me: any) => {
        this.currentUserId = me?.username || null;
        this.currentUserAvatar = me?.profilePhotoUrl || null;
        // Now load conversations
        this.loadConversations();
      },
      error: () => {
        // still attempt to load conversations even if profile fails
        this.loadConversations();
      }
    });

    // If navigated with ?roomId=..., select it when rooms load
    this.route.queryParamMap.subscribe(q => {
      const roomId = q.get('roomId');
      if (roomId) {
        // ensure we have latest rooms then select
        this.loadConversations(roomId);
      }
    });

    // Poll for conversation list every 10 seconds so lateral panel stays updated
    this.refreshIntervalId = setInterval(() => {
      this.loadConversations();
    }, 10000);
  }

  ngOnDestroy(): void {
    try { if (this.refreshIntervalId) clearInterval(this.refreshIntervalId); } catch (e) {}
    try { if (this.roomSub && this.roomSub.unsubscribe) this.roomSub.unsubscribe(); } catch (e) {}
  }

  // Return comma-separated participant usernames (safe for template)
  participantsNames(participants: UserBrief[] | undefined): string {
    if (!participants || participants.length === 0) return '';
    // support two shapes: array of UserBrief OR array of strings (usernames)
    const first = participants[0] as any;
    if (typeof first === 'string') {
      return (participants as unknown as string[]).join(', ');
    }
    return (participants as UserBrief[]).map(p => p.username).join(', ');
  }

  selectConversation(conv: any) {
    if (!conv) return;
    this.selectedConversation = conv;
    this.loadMessages(conv.id);
    // subscribe to websocket topic for live messages
    // unsubscribe previous room subscription if any
    try { if (this.roomSub && this.roomSub.unsubscribe) this.roomSub.unsubscribe(); } catch (e) {}
    this.roomSub = this.chat.subscribeToRoom(conv.id).subscribe((m: Message) => {
      this.messages.push(m);
      setTimeout(() => this.scrollToBottom(), 50);
    }, err => {
      console.error('[Chat] room subscription error', err);
    });
  }

  search() {
    const q = (this.searchQuery || '').trim();
    if (!q) { this.users = []; return; }
    this.chat.searchUsers(q).subscribe(r => this.users = r);
  }

  async selectUser(user: UserBrief) {
    // create or get conversation with user (backend expects username)
    this.chat.createRoomWithUsername(user.username).subscribe((conv: any) => {
      this.selectedConversation = conv;
      this.loadMessages(conv.id);
      // refresh conversations list
      this.loadConversations();
    });
  }

  loadConversations(selectedRoomId?: string) {
    this.loadingConversations = true;
    this.chat.getRooms().subscribe(dto => {
      console.log('[Chat] getConversations response', dto);
      // dto.username is an array of partner usernames in the same order as chatRooms
      const rooms = (dto.chatRooms || []).map((r: any, idx: number) => {
        const partner = (dto.username && dto.username[idx]) ? dto.username[idx] : null;
        return {
          ...r,
          partnerUsername: partner,
          partnerAvatar: null
        };
      });
      // sort by lastMessageTime desc (newest first)
      rooms.sort((a: any, b: any) => {
        const ta = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
        const tb = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
        return tb - ta;
      });
      this.conversations = rooms;
      // Try to fetch avatars for partners (best-effort)
      this.conversations.forEach((c: any) => {
        if (c.partnerUsername) {
          this.accountService.getPublicProfile(c.partnerUsername).subscribe({
            next: (p: any) => c.partnerAvatar = p?.profilePhotoUrl || null,
            error: () => { /* ignore */ }
          });
        }
      });
      this.loadingConversations = false;
      if (selectedRoomId) {
        const found = this.conversations.find((c: any) => c.id === selectedRoomId);
        if (found) this.selectConversation(found);
        else {
          // If the server returned no conversation with that id (or list is empty),
          // try to subscribe/load directly by id. This happens when we navigate
          // from a public profile using a room id but the server list doesn't
          // include the room (yet). We still want to open the chat and allow
          // sending messages if the user is participant.
          this.selectConversationById(selectedRoomId);
        }
      }
    }, () => this.loadingConversations = false);
  }

  /**
   * Try to open a conversation when we only have the roomId (not present in
   * the conversations list). We subscribe to the room topic and load history.
   */
  selectConversationById(roomId: string) {
    if (!roomId) return;
    // create a minimal conversation object so the UI enables the composer
    this.selectedConversation = { id: roomId } as any;

    // Subscribe to websocket topic (interceptor will validate membership)
    this.chat.subscribeToRoom(roomId).subscribe({
      next: (m: Message) => {
        this.messages.push(m);
        setTimeout(() => this.scrollToBottom(), 50);
      },
      error: (err: any) => {
        console.error('[Chat] subscribeToRoom error', err);
        // If subscription failed (not authorized), clear selection
        this.selectedConversation = null;
      }
    });

    // Load history (may be empty) so the user sees previous messages
    this.loadMessages(roomId);
  }

  loadMessages(conversationId: string) {
    console.log('[Chat] loadMessages for', conversationId);
    this.chat.getHistory(conversationId).subscribe(msgs => {
      console.log('[Chat] getHistory response', msgs);
        // backend ChatMessage has 'content' and 'senderId' -> map to local Message
        this.messages = (msgs || []).map((m: any) => ({ id: m.id, senderId: m.senderId, text: m.content, timestamp: m.timestamp }));
      setTimeout(() => this.scrollToBottom(), 50);
    });
  }

  send() {
      if (!this.selectedConversation || !this.newMessage.trim()) return;
      const text = this.newMessage.trim();
      const convId = this.selectedConversation.id;
      // Send via WebSocket
      this.chat.sendWsMessage(convId, text);
      // optimistic push using actual current user id when available
      const senderId = this.currentUserId || 'me';
      this.messages.push({ senderId, text, timestamp: new Date().toISOString() });
    this.newMessage = '';
    this.scrollToBottom();
    this.loadConversations();
  }

  private scrollToBottom() {
    try {
      const el = document.querySelector('.chat-messages');
      if (el) el.scrollTop = el.scrollHeight;
    } catch (e) { /* ignore */ }
  }
}
