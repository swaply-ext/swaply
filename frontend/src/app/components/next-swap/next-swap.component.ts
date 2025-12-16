import { Component, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../services/account.service';
import { SwapService } from '../../services/swap.service';
import { UsersService } from '../../services/users.service';

interface profileToTeach {
  title: string;
  imgToTeach: string;
  profilePhotoUrl: string;
  location: string;
  username: string;
}
interface profileToLearn {
  title: string;
  imgToLearn: string;
  profilePhotoUrl: string;
  location: string;
  username: string;
}
interface nextSwap {
  id: string;
  requestedUserId: string;
  skill: string;
  interest: string;
  status: 'ACCEPTED' | 'STANDBY' | 'DENIED';
  isRequester: boolean;
}

@Component({
  selector: 'app-next-swap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './next-swap.component.html',
  styleUrl: './next-swap.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NextSwapComponent {
  constructor(private swapService: SwapService,
    private accountService: AccountService,
    private usersService: UsersService) { }

  nextSwap = signal<nextSwap | null>(null);
  profileToTeach = signal<profileToTeach | null>(null);
  profileToLearn = signal<profileToLearn | null>(null);

  hasIntercambio = signal(true);
  isConfirmed = signal(false);

  imageToLearn = computed(() => {
    const swap = this.nextSwap();
    if (!swap) return 'assets/photos_skills/default.jpg'; // Imagen por defecto si es null
    // Pasamos '' como categoría ya que no viene en el objeto swap, la función buscará por nombre
    return this.assignImageToSkill('', swap.interest) || 'assets/photos_skills/default.jpg';
  });

  imageToTeach = computed(() => {
    const swap = this.nextSwap();
    if (!swap) return 'assets/photos_skills/default.jpg';
    return this.assignImageToSkill('', swap.skill) || 'assets/photos_skills/default.jpg';
  });

  ngOnInit(): void {
    this.getNextSwap();
    this.getUserTeach();
  }
  //recibir proximo intercambio
  getNextSwap(): void {
    this.swapService.getNextSwap().subscribe({
      next: (swap) => {
        console.log('Datos recibidos del backend', swap);
        this.nextSwap.set(swap);
        if (swap?.requestedUserId) {
          this.getUserLearn(swap.requestedUserId);
        }
      },
      error: (err) => {
        console.error('Error al obtener swap:', err);
        this.nextSwap.set(null);
      }
    });
  }
  //recibir user
  getUserTeach(): void {
    this.accountService.getProfileData().subscribe({
      next: (user) => {
        console.log('Datos recibidos del backend', user);
        this.profileToTeach.set(user);
      },
      error: (err) => {
        console.error('Error al obtener swap:', err);
        this.nextSwap.set(null);
      }
    });
  }

  //recibir usuario a enseñar
  getUserLearn(userId: string): void {
    this.usersService.getUserById(userId).subscribe({
      next: (user) => {
        console.log('Usuario a aprender recibido:', user);
        // Aquí asumimos que el backend devuelve un objeto que encaja con la interfaz profileToLearn
        // Si no, deberías mapearlo manualmente aquí.
        this.profileToLearn.set(user);
      },
      error: (err) => {
        console.error('Error al obtener datos del usuario partner:', err);
      }
    });
  }

  private assignImageToSkill(category: string, skillName: string): string | undefined {
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

    // Buscar coincidencia exacta de palabras clave
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

  // --- FUNCIONES DE LOS BOTONES ---
  toggleIntercambio() {
    this.hasIntercambio.update(value => !value);
    this.isConfirmed.set(false);
  }

  toggleConfirmation() {
    this.isConfirmed.update(value => !value);
  }
  toggleDeny() {
    this.isConfirmed.set(false);
  }

}
