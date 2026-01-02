import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService, ChatMessage } from '../../services/chat.service';
import { AccountService } from '../../services/account.service';
import { Subscription, interval } from 'rxjs';

// Interfaz para facilitar el uso en el HTML (unimos lo que el back da separado)
interface UIConversation {
  roomId: string;
  partnerUsername: string;
  partnerAvatar: string; // Lo cargaremos asíncronamente
  lastMessage: string;
  lastMessageTime: Date | null;
  unreadCount: number;
}

@Component({
  standalone: true,
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html', // Usaremos el HTML principal, no el clean
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  // Estado del Usuario Actual
  currentUserId: string = ''; // Necesario para saber si el mensaje es mio (derecha) o suyo (izquierda)
  currentUserAvatar: string = '';

  // Listas y Selección
  conversations: UIConversation[] = []; // Lista lateral
  selectedConversation: UIConversation | null = null; // Chat abierto actualmente
  messages: ChatMessage[] = []; // Mensajes del chat abierto
  
  // Inputs
  newMessage: string = '';
  searchQuery: string = ''; // Para filtrar chats en el lateral

  isMobile: boolean = false;
  // Control
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
    // 1. Obtener quién soy (ID y Avatar)
    this.accountService.getProfileData().subscribe({
      next: (profile: any) => {
        // Ajusta 'username' o 'id' según lo que use tu backend como senderId en los mensajes
        this.currentUserId = profile.username; 
        this.currentUserAvatar = profile.profilePicture || 'assets/default-image.jpg';
        
        // 2. Cargar Conversaciones iniciales
        this.loadConversations();

        // 3. Revisar si la URL ya trae un roomId (?roomId=...)
        this.route.queryParams.subscribe(params => {
          const roomId = params['roomId'];
          if (roomId) {
            this.handleDeepLink(roomId);
          }
        });

        // 4. Iniciar Polling (refrescar lista lateral cada 5s)
        this.pollingSub = interval(5000).subscribe(() => {
          this.loadConversations(false); // false = no resetear loading
        });
      },
      error: (err) => console.error('Error cargando perfil', err)
    });
  }

  // Método auxiliar
  checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
  }

  ngOnDestroy(): void {
    if (this.pollingSub) this.pollingSub.unsubscribe();
    if (this.chatSub) this.chatSub.unsubscribe();
  }

  /**
   * Carga la lista de chats del backend y los transforma a UIConversation
   * @param showLoading Spinner visual
   */
  loadConversations(showLoading = true): void {
    if (showLoading) this.loadingConversations = true;

    this.chatService.getRooms().subscribe({
      next: (dto) => {
        // EL BACKEND DEVUELVE 2 ARRAYS: username[] y chatRooms[]
        // Asumimos que están ordenados por índice: username[0] va con chatRooms[0]
        
        if (!dto.chatRooms || !dto.username) {
          this.conversations = [];
          this.loadingConversations = false;
          return;
        }

        const mapped: UIConversation[] = dto.chatRooms.map((room, index) => {
          const partnerName = dto.username[index] || 'Usuario desconocido';
          
          // Preservar avatar si ya lo teníamos cargado para evitar parpadeo
          const existing = this.conversations.find(c => c.roomId === room.id);
          
          return {
            roomId: room.id,
            partnerUsername: partnerName,
            partnerAvatar: existing ? existing.partnerAvatar : 'assets/default-image.jpg', 
            lastMessage: room.lastMessagePreview || 'Nueva conversación',
            lastMessageTime: room.lastMessageTime ? new Date(room.lastMessageTime) : null,
            unreadCount: 0 // Si tu backend implementa unreadCounts, úsalo aquí: room.unreadCounts[this.currentUserId]
          };
        });

        // Ordenar por fecha (más reciente arriba)
        mapped.sort((a, b) => {
          const timeA = a.lastMessageTime ? a.lastMessageTime.getTime() : 0;
          const timeB = b.lastMessageTime ? b.lastMessageTime.getTime() : 0;
          return timeB - timeA;
        });

        this.conversations = mapped;
        this.loadingConversations = false;

        // Carga diferida de avatares (para no bloquear)
        this.fetchAvatarsForConversations();
        
        // Si hay una sala seleccionada, actualizar sus datos en tiempo real (ej. lastMessage) en el lateral
        if (this.selectedConversation) {
            const updated = this.conversations.find(c => c.roomId === this.selectedConversation?.roomId);
            if (updated) {
                // Actualizar referencia visual del lateral, pero no re-seleccionar para no recargar chat
                // Opcional: actualizar unread counts
            }
        }
      },
      error: () => this.loadingConversations = false
    });
  }

  /**
   * Intenta obtener los avatares reales de los usuarios
   */
  fetchAvatarsForConversations() {
    this.conversations.forEach(conv => {
      if (conv.partnerAvatar === 'assets/default-image.jpg') {
        this.accountService.getPublicProfile(conv.partnerUsername).subscribe({
          next: (profile: any) => {
            if (profile && profile.profilePicture) {
              conv.partnerAvatar = profile.profilePicture;
            }
          },
          error: () => {} // Si falla, se queda con el default
        });
      }
    });
  }

  /**
   * Maneja cuando entras por URL directa (ej. desde Public Profile)
   */
  handleDeepLink(roomId: string) {
    // 1. Ver si ya está en la lista cargada
    const found = this.conversations.find(c => c.roomId === roomId);
    if (found) {
      this.selectConversation(found);
    } else {
      // 2. Si no está (ej. sala nueva que el polling aún no trajo), 
      // creamos un objeto temporal y lo seleccionamos.
      // Nota: No tenemos el username del partner aquí fácilmente sin llamar al backend de la sala,
      // pero cargaremos el historial igual.
      const tempConv: UIConversation = {
        roomId: roomId,
        partnerUsername: 'Cargando...', // Se actualizará en el próximo poll
        partnerAvatar: 'assets/default-image.jpg',
        lastMessage: '',
        lastMessageTime: new Date(),
        unreadCount: 0
      };
      this.selectConversation(tempConv);
    }
  }

  /**
   * Acción al hacer clic en un chat del lateral
   */
  selectConversation(conv: UIConversation): void {
    if (this.selectedConversation?.roomId === conv.roomId) return; // Ya estamos aquí

    this.selectedConversation = conv;
    this.messages = []; // Limpiar chat previo

    // Actualizar URL sin recargar la página (para poder compartir el link)
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { roomId: conv.roomId },
      queryParamsHandling: 'merge'
    });

    // 1. Cargar Historial
    this.chatService.getHistory(conv.roomId).subscribe(msgs => {
        this.messages = msgs;
        this.scrollToBottom();
    });

    // 2. Suscribirse a WebSockets
    if (this.chatSub) this.chatSub.unsubscribe();
    
    this.chatSub = this.chatService.subscribeToRoom(conv.roomId).subscribe((msg) => {
      this.messages.push(msg);
      this.scrollToBottom();
      
      // Actualizar vista lateral "último mensaje"
      conv.lastMessage = msg.content;
      conv.lastMessageTime = new Date(msg.timestamp);
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedConversation) return;

    const text = this.newMessage;
    const roomId = this.selectedConversation.roomId;

    // Enviar por WS
    this.chatService.sendWsMessage(roomId, text);

    // Optimistic Update (opcional, si el WS tarda)
    // El server nos devolverá el mensaje por la suscripción, 
    // pero si quieres instantaneidad total:
    /*
    this.messages.push({
      id: 'temp-' + Date.now(),
      roomId: roomId,
      senderId: this.currentUserId,
      content: text,
      timestamp: new Date().toISOString()
    });
    this.scrollToBottom();
    */

    this.newMessage = '';
  }

  // Filtrado de la lista lateral (Buscador)
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