import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, UserBrief, Message } from '../../services/chat.service';
import { ActivatedRoute, Router } from '@angular/router';

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

  private roomSub: any;

  constructor(private chat: ChatService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.loadConversations();

    // If navigated with ?roomId=..., select it when rooms load
    this.route.queryParamMap.subscribe(q => {
      const roomId = q.get('roomId');
      if (roomId) {
        // ensure we have latest rooms then select
        this.loadConversations(roomId);
      }
    });
  }

  // Return comma-separated participant usernames (safe for template)
  participantsNames(participants: UserBrief[] | undefined): string {
    if (!participants || participants.length === 0) return '';
    return participants.map(p => p.username).join(', ');
  }

  selectConversation(conv: any) {
    if (!conv) return;
    this.selectedConversation = conv;
    this.loadMessages(conv.id);
    // subscribe to websocket topic for live messages
    if (this.roomSub) {
      // no-op: subjects are per-room in service
    }
    this.chat.subscribeToRoom(conv.id).subscribe((m: Message) => {
      this.messages.push(m);
      setTimeout(() => this.scrollToBottom(), 50);
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
      this.conversations = dto.chatRooms || [];
      this.loadingConversations = false;
      if (selectedRoomId) {
        const found = this.conversations.find((c: any) => c.id === selectedRoomId);
        if (found) this.selectConversation(found);
      }
    }, () => this.loadingConversations = false);
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
    // optimistic push
    this.messages.push({ senderId: 'me', text, timestamp: new Date().toISOString() });
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
