import { Component, signal, ChangeDetectionStrategy, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SwapService } from '../../services/swap.service';
import { UsersService } from '../../services/users.service';
import { AccountService } from '../../services/account.service';

// Asegúrate de que estas interfaces estén disponibles o impórtalas si las mueves a un models.ts
export interface Profile {
  title?: string;
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
  private swapService = inject(SwapService);
  private accountService = inject(AccountService);
  private usersService = inject(UsersService);

  // --- CAMBIO IMPORTANTE: Input para recibir datos del padre ---
  @Input() set swapsList(data: Swap[]) {
    // Cuando el padre nos manda datos, actualizamos la señal y cargamos perfiles
    this.swaps.set(data);
    this.loadOtherProfiles(data);
    this.loading.set(false);
  }



  swaps = signal<Swap[]>([]);
  currentUser = signal<Profile | null>(null);
  profilesMap = signal<Map<string, Profile>>(new Map());
  loading = signal(true);

  ngOnInit(): void {
    // 1. Cargamos nuestro perfil (necesario para pintar la tarjeta correctamente)
    this.accountService.getProfileData().subscribe({
      next: (user) => this.currentUser.set(user),
      error: () => console.error('Error cargando perfil propio')
    });

    // YA NO cargamos los swaps aquí. Esperamos a que el padre nos los pase vía @Input.

  }

  // --- El resto de métodos se quedan igual ---

  loadOtherProfiles(swapsList: Swap[]) {
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


  getOtherProfile(userId: string): Profile | undefined {
    return this.profilesMap().get(userId);
  }

  getImageToLearn(swap: Swap): string {
    return this.assignImageToSkill('', swap.interest) || 'assets/photos_skills/default.jpg';
  }

  getImageToTeach(swap: Swap): string {
    return this.assignImageToSkill('', swap.skill) || 'assets/photos_skills/default.jpg';
  }

  confirmIntercambio(swap: Swap) {
    if (!swap.id) return;
    this.swapService.updateSwapStatus(swap.id, 'ACCEPTED').subscribe({
      next: () => this.updateLocalSwapStatus(swap.id, 'ACCEPTED')
    });
  }

  denyIntercambio(swap: Swap) {
    if (!swap.id) return;
    this.swapService.updateSwapStatus(swap.id, 'DENIED').subscribe({
      next: () => this.updateLocalSwapStatus(swap.id, 'DENIED')
    });
  }

  private updateLocalSwapStatus(swapId: string, newStatus: 'ACCEPTED' | 'STANDBY' | 'DENIED') {
    this.swaps.update(currentSwaps =>
      currentSwaps.map(s => s.id === swapId ? { ...s, status: newStatus } : s)
    );
  }

  private assignImageToSkill(category: string, skillName: string): string | undefined {
    // Tu lógica de imágenes existente...
    if (!skillName) return undefined;

    const name = skillName.toLowerCase();

    // Mapa de palabras clave a imágenes y carpetas
    const skillMap: { [key: string]: { folder: string, filename: string } } = {
      // Deportes
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

      // Música
      'guitarra': { folder: 'music', filename: 'guitar.jpg' },
      'piano': { folder: 'music', filename: 'piano.jpg' },
      'violín': { folder: 'music', filename: 'violin.jpg' },
      'violin': { folder: 'music', filename: 'violin.jpg' },
      'batería': { folder: 'music', filename: 'drums.jpg' },
      'bateria': { folder: 'music', filename: 'drums.jpg' },
      'saxofón': { folder: 'music', filename: 'saxophone.jpg' },
      'saxofon': { folder: 'music', filename: 'saxophone.jpg' },

      // Ocio / Otros
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

    // Si no hay coincidencia, asigna carpeta según categoría
    let folder = 'leisure';
    if (category) {
      const cat = category.toLowerCase();
      if (cat.includes('deporte') || cat.includes('sports')) folder = 'sports';
      if (cat.includes('música') || cat.includes('musica')) folder = 'music';
    }

    return undefined;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}



