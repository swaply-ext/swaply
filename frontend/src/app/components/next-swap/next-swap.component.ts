import { Component, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../services/account.service';
import { SwapService } from '../../services/swap.service';
import { UsersService } from '../../services/users.service';
import { RouterLink } from '@angular/router';
import { UserSkills } from '../../models/user-skills.model';


interface profileToTeach {
  title: string;
  imgToTeach: string;
  profilePhotoUrl: string;
  location: string;
  username: string;
  skills: UserSkills[];
}
interface profileToLearn {
  title: string;
  imgToLearn: string;
  profilePhotoUrl: string;
  location: string;
  username: string;
  rating: number;
  skills: UserSkills[];
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
  imports: [CommonModule, RouterLink],
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
  isDenied = signal(false);

  getStarIcon(rating: number): string {
    const decimal = rating - Math.floor(rating);
    if (decimal >= 0.5) return 'star_half';
    return 'star';
  }

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
    if (this.nextSwap() == null) {
      this.hasIntercambio.set(false);
    }
  }
  //recibir proximo intercambio
  getNextSwap(): void {
    this.swapService.getNextSwap().subscribe({
      next: (swap) => {
        this.isConfirmed.set(false);
        this.isDenied.set(false);
        this.nextSwap.set(swap);
        if (swap?.requestedUserId) {
          this.hasIntercambio.set(true);
          this.getUserLearn(swap.requestedUserId);
        }
        //comprobar que no hay:
        if (swap == null) {
          this.hasIntercambio.set(false);
        }
      },
      error: (err) => {
        this.nextSwap.set(null);
        this.hasIntercambio.set(false);
      }
    });
  }
  //recibir user
  getUserTeach(): void {
    this.accountService.getProfileData().subscribe({
      next: (user) => {
        this.profileToTeach.set({
          ...user,
          skills: user.skills || []
        });

        console.log('skills teach:', this.profileToTeach()?.skills);
      },
      error: (err) => {
        this.nextSwap.set(null);
      }
    });
  }

  //recibir usuario a enseñar
  getUserLearn(userId: string): void {
    this.usersService.getUserById(userId).subscribe({
      next: (user) => {
        // Add default rating if not provided by backend
        this.profileToLearn.set({
          ...user,
          rating: user.rating ?? 3.8,
          skills: user.skills || []
        });
         console.log('skills learn:', this.profileToLearn()?.skills);
      },
      error: (err) => {
      }
    });
  }

  confirmIntercambio() {
    const currentSwap = this.nextSwap();

    if (!currentSwap || !currentSwap.id) {
      return;
    }

    this.swapService.updateSwapStatus(currentSwap.id, 'ACCEPTED').subscribe({
      next: async (response) => {
        this.isConfirmed.set(true);
        await this.sleep(1000);
        this.ngOnInit();
      },
      error: (err) => {
      }
    });
  }

  denyIntercambio() {
    const currentSwap = this.nextSwap();

    if (!currentSwap || !currentSwap.id) {
      return;
    }


    this.swapService.updateSwapStatus(currentSwap.id, 'DENIED').subscribe({
      next: async () => {
        this.isDenied.set(true);
        await this.sleep(1000);
        this.ngOnInit();
      },
      error: (err) => {
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
      'básquet': { folder: 'sports', filename: 'basketball.jpg' },
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

  private normalizeString(str: string): string {
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  getSkillLevel(skills: UserSkills[], skillName: string): number {
    const normalizedName = this.normalizeString(skillName);
    const skill = skills.find(s => this.normalizeString(s.id) === normalizedName);
    console.log('skills:', skills, 'skillName:', skillName, 'normalized:', normalizedName, 'found skill:', skill, 'level:', skill?.level);
    return skill ? Number(skill.level) || 0 : 0 ;
    
  }

  getLevelText(level: number): string {
    switch (level) {
      case 1: return 'principiante';
      case 2: return 'Intermedio';
      case 3: return 'Experto';
      default: return 'unknown';
    }
  }


  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
