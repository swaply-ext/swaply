import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppNavbarComponent } from "../../components/app-navbar/app-navbar.component";
import { SwapListComponent, Swap, Profile } from '../../components/swap-list/swap-list.component';
import { SwapService } from '../../services/swap.service';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-my-swaps-page',
  standalone: true,
  imports: [CommonModule, AppNavbarComponent, SwapListComponent],
  templateUrl: './my-swaps.component.html',
  styleUrl: './my-swaps.component.css'
})
export class MySwapsPageComponent implements OnInit {
  private swapService = inject(SwapService);
  private usersService = inject(UsersService);
  private router = inject(Router);

  // Datos
  acceptedSwaps: Swap[] = [];
  pendingSwaps: Swap[] = [];
  
  // Mapa de perfiles (ID usuario -> Datos perfil)
  pendingProfiles = new Map<string, Profile>();

  // Estado de carga (Renombrado a isLoading para coincidir con tu HTML)
  isLoading = true;

  ngOnInit() {
    this.loadAllSwaps();
  }

  loadAllSwaps() {
    this.isLoading = true;
    
    this.swapService.getAllSwaps().subscribe({
      next: (data: Swap[]) => {
        // 1. Filtrar Aceptados
        this.acceptedSwaps = data.filter(s => s.status === 'ACCEPTED');

        // 2. Filtrar Pendientes (donde NO soy yo el que pidió)
        this.pendingSwaps = data.filter(s => s.status === 'STANDBY' && s.isRequester === false);

        // 3. Cargar perfiles necesarios para el banner
        this.loadPendingProfiles();

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando swaps', err);
        this.isLoading = false;
      }
    });
  }

  loadPendingProfiles() {
    const userIds = new Set(this.pendingSwaps.map(s => s.requestedUserId));
    
    userIds.forEach(id => {
      this.usersService.getUserById(id).subscribe(profile => {
        this.pendingProfiles.set(id, profile);
      });
    });
  }

  // --- MÉTODOS QUE FALTABAN Y CAUSABAN EL ERROR ---

  // 1. Método para obtener el usuario del banner (Soluciona el error getRequesterUser)
  getRequesterUser(swap: Swap): Profile | undefined {
    return this.pendingProfiles.get(swap.requestedUserId);
  }

  // 2. Getter para el texto del banner (Soluciona error de bannerText)
  get bannerText(): string {
    const count = this.pendingSwaps.length;
    if (count === 0) return '';
    
    // Obtenemos el nombre del primer usuario pendiente
    const firstSwap = this.pendingSwaps[0];
    const firstProfile = this.pendingProfiles.get(firstSwap.requestedUserId);
    const name = firstProfile?.username || 'Usuario';

    if (count === 1) {
      return `<b>@${name}</b> solicita un intercambio.`;
    } else {
      return `<b>@${name}</b> y <b>${count - 1} más</b> solicitan intercambios.`;
    }
  }

  // 3. Navegación
  goToRequests() {
    this.router.navigate(['/notifications']); 
  }
}