import { Component, signal, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { SwapService } from '../../services/swap.service';
import { UsersService } from '../../services/users.service';

// Reutilizamos tus interfaces (puedes moverlas a un archivo models.ts si prefieres)
export interface Profile {
  title?: string; // Opcional según tu backend
  imgToTeach?: string;
  profilePhotoUrl: string;
  location: string;
  username: string;
}

export interface Swap {
  id: string;
  requestedUserId: string;
  skill: string;
  interest: string;
  status: 'ACCEPTED' | 'STANDBY' | 'DENIED';
  isRequester: boolean;
}

@Component({
  selector: 'app-swap-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './swap-list.component.html',
  styleUrl: './swap-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapListComponent implements OnInit {
  // Inyección de dependencias (estilo moderno)
  private swapService = inject(SwapService);
  private accountService = inject(AccountService);
  private usersService = inject(UsersService);

  // Signals
  swaps = signal<Swap[]>([]);
  currentUser = signal<Profile | null>(null);
  
  // Mapa para guardar los perfiles de los otros usuarios: ID -> Perfil
  profilesMap = signal<Map<string, Profile>>(new Map());

  loading = signal(true);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    
    // 1. Obtener mi propio perfil
    this.accountService.getProfileData().subscribe({
      next: (user) => this.currentUser.set(user),
      error: () => console.error('Error cargando perfil propio')
    });

    // 2. Obtener todos los intercambios
    // ASUMO que existe un método getAllSwaps o similar en tu servicio
    this.swapService.getAllSwaps().subscribe({ // Asegúrate de tener este método en el backend/servicio
      next: (data) => {
        this.swaps.set(data);
        this.loadOtherProfiles(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
      }
    });
  }

  // Carga los perfiles de los usuarios con los que intercambias
  loadOtherProfiles(swapsList: Swap[]) {
    const userIds = new Set(swapsList.map(s => s.requestedUserId));
    
    userIds.forEach(id => {
      // Evitamos llamar si ya lo tenemos (aunque al inicio estará vacío)
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

  // --- Helpers para la vista ---

  getOtherProfile(userId: string): Profile | undefined {
    return this.profilesMap().get(userId);
  }

  getImageToLearn(swap: Swap): string {
    return this.assignImageToSkill('', swap.interest) || 'assets/photos_skills/default.jpg';
  }

  getImageToTeach(swap: Swap): string {
    return this.assignImageToSkill('', swap.skill) || 'assets/photos_skills/default.jpg';
  }

  // --- Acciones ---

  confirmIntercambio(swap: Swap) {
    if (!swap.id) return;

    this.swapService.updateSwapStatus(swap.id, 'ACCEPTED').subscribe({
      next: () => {
        // Actualizamos el estado localmente para reflejar el cambio inmediato
        this.updateLocalSwapStatus(swap.id, 'ACCEPTED');
      }
    });
  }

  denyIntercambio(swap: Swap) {
    if (!swap.id) return;

    this.swapService.updateSwapStatus(swap.id, 'DENIED').subscribe({
      next: () => {
        this.updateLocalSwapStatus(swap.id, 'DENIED');
      }
    });
  }

  private updateLocalSwapStatus(swapId: string, newStatus: 'ACCEPTED' | 'STANDBY' | 'DENIED') {
    this.swaps.update(currentSwaps => 
      currentSwaps.map(s => s.id === swapId ? { ...s, status: newStatus } : s)
    );
  }

  // --- Lógica de Imágenes (Reutilizada) ---
  private assignImageToSkill(category: string, skillName: string): string | undefined {
    if (!skillName) return undefined;
    const name = skillName.toLowerCase();
    
    const skillMap: { [key: string]: { folder: string, filename: string } } = {
      'fútbol': { folder: 'sports', filename: 'football.jpg' },
      'futbol': { folder: 'sports', filename: 'football.jpg' },
      'pádel': { folder: 'sports', filename: 'padel.jpg' },
      'padel': { folder: 'sports', filename: 'padel.jpg' },
      'basquet': { folder: 'sports', filename: 'basketball.jpg' },
      'baloncesto': { folder: 'sports', filename: 'basketball.jpg' },
      'basket': { folder: 'sports', filename: 'basketball.jpg' },
      'vóley': { folder: 'sports', filename: 'voleyball.jpg' },
      'voley': { folder: 'sports', filename: 'voleyball.jpg' },
      'boxeo': { folder: 'sports', filename: 'boxing.jpg' },
      'guitarra': { folder: 'music', filename: 'guitar.jpg' },
      'piano': { folder: 'music', filename: 'piano.jpg' },
      'violín': { folder: 'music', filename: 'violin.jpg' },
      'violin': { folder: 'music', filename: 'violin.jpg' },
      'batería': { folder: 'music', filename: 'drums.jpg' },
      'bateria': { folder: 'music', filename: 'drums.jpg' },
      'saxofón': { folder: 'music', filename: 'saxophone.jpg' },
      'saxofon': { folder: 'music', filename: 'saxophone.jpg' },
      'dibujo': { folder: 'leisure', filename: 'draw.jpg' },
      'cocina': { folder: 'leisure', filename: 'cook.jpg' },
      'baile': { folder: 'leisure', filename: 'dance.jpg' },
      'dance': { folder: 'leisure', filename: 'dance.jpg' },
      'manualidades': { folder: 'leisure', filename: 'crafts.jpg' },
      'digital': { folder: 'leisure', filename: 'digital_entertainment.jpg' }
    };

    for (const key in skillMap) {
      if (name.includes(key)) {
        const skill = skillMap[key];
        return `assets/photos_skills/${skill.folder}/${skill.filename}`;
      }
    }

    let folder = 'leisure';
    if (category) {
      const cat = category.toLowerCase();
      if (cat.includes('deporte') || cat.includes('sports')) folder = 'sports';
      if (cat.includes('música') || cat.includes('musica')) folder = 'music';
    }
    return undefined;
  }
}