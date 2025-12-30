import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppNavbarComponent } from "../../components/app-navbar/app-navbar.component"; // Asegura la ruta correcta
import { SwapService } from '../../services/swap.service';
import { UsersService } from '../../services/users.service';
import { AccountService } from '../../services/account.service';

// Reutilizamos las interfaces (idealmente deberías tenerlas en un archivo models.ts)
export interface Profile {
  username: string;
  profilePhotoUrl: string;
  location: string;
}

export interface Swap {
  id: string;
  requestedUserId: string; // El ID del otro usuario
  skill: string;           // Lo que yo enseño
  interest: string;        // Lo que yo aprendo
  status: 'ACCEPTED' | 'STANDBY' | 'DENIED';
  isRequester: boolean;
}

@Component({
  selector: 'app-swap-requests',
  standalone: true,
  imports: [CommonModule, AppNavbarComponent, RouterLink],
  templateUrl: './swap-requests.component.html',
  styleUrl: './swap-requests.component.css'
})
export class SwapRequestsComponent implements OnInit {
  private swapService = inject(SwapService);
  private usersService = inject(UsersService);
  
  // Signals para el estado
  requests = signal<Swap[]>([]);
  loading = signal<boolean>(true);
  
  // Mapa para guardar los perfiles de quienes nos envían la solicitud
  profilesMap = signal<Map<string, Profile>>(new Map());

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.loading.set(true);
    this.swapService.getAllSwaps().subscribe({
      next: (data: Swap[]) => {
        // FILTRO IMPORTANTE:
        // 1. Estado STANDBY
        // 2. isRequester === false (Significa que ME lo pidieron a mí)
        const pending = data.filter(s => s.status === 'STANDBY' && s.isRequester === false);
        
        this.requests.set(pending);
        this.loadProfiles(pending);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando solicitudes', err);
        this.loading.set(false);
      }
    });
  }

  loadProfiles(swapsList: Swap[]) {
    const userIds = new Set(swapsList.map(s => s.requestedUserId));
    
    userIds.forEach(id => {
      if (!this.profilesMap().has(id)) {
        this.usersService.getUserById(id).subscribe(profile => {
          this.profilesMap.update(map => {
            const newMap = new Map(map);
            newMap.set(id, profile);
            return newMap;
          });
        });
      }
    });
  }

  // --- Acciones de los botones ---

  acceptRequest(swap: Swap) {
    this.swapService.updateSwapStatus(swap.id, 'ACCEPTED').subscribe({
      next: () => {
        // Eliminamos la solicitud de la lista visualmente porque ya no es "pendiente"
        this.removeSwapFromList(swap.id);
      },
      error: (err) => console.error(err)
    });
  }

  rejectRequest(swap: Swap) {
    this.swapService.updateSwapStatus(swap.id, 'DENIED').subscribe({
      next: () => {
        this.removeSwapFromList(swap.id);
      },
      error: (err) => console.error(err)
    });
  }

  private removeSwapFromList(swapId: string) {
    this.requests.update(list => list.filter(s => s.id !== swapId));
  }

  // --- Helpers visuales ---

  getProfile(userId: string): Profile | undefined {
    return this.profilesMap().get(userId);
  }

  // Lógica de imágenes (simplificada para mostrar iconos o fotos pequeñas si quieres)
  // De momento usaremos solo el avatar del usuario, pero si quieres mostrar la habilidad:
  getSkillImage(skillName: string): string {
     // Puedes copiar tu función assignImageToSkill aquí si quieres mostrar la foto de la actividad
     return 'assets/photos_skills/default.jpg'; 
  }
}