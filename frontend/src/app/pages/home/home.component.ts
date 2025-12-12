import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppNavbarComponent } from "../../components/app-navbar/app-navbar.component";
import { SkillSearchComponent } from '../../components/skill-search/skill-search.component'; 
import { FilterSkillsComponent } from '../../components/filter-skills/filter-skills.component';
import { SearchService, UserSwapDTO } from '../../services/search.services';

export interface CardModel {
  userId?: string;
  userName: string;          
  userAvatar: string;        
  skillTitle: string;        
  skillImage?: string;       
  skillIcon?: string;        
  distance: string;
  rating: number;
  isMatch: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, AppNavbarComponent, SkillSearchComponent, FilterSkillsComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  private searchService = inject(SearchService);
  private router = inject(Router);

  private allCards: CardModel[] = []; 
  cards = signal<CardModel[]>([]);

  isLoadingMatches = signal(false);
  hasSearched = signal(false); 
  itemsToShow = signal(6);

  canLoadMore = computed(() => this.cards().length < this.allCards.length);

  ngOnInit() {
    this.loadInitialRecommendations();
  }

  loadInitialRecommendations() {
    this.isLoadingMatches.set(true); 
    this.searchService.getRecommendations().subscribe({
      next: (matches) => this.processResults(matches),
      error: (err) => {
        console.error("Error cargando recomendaciones:", err);
        this.isLoadingMatches.set(false);
      }
    });
  }

  performMatchSearch(skillQuery: string) {
    if (!skillQuery || skillQuery.trim() === '') {
      this.hasSearched.set(false); 
      this.loadInitialRecommendations();
      return;
    }

    this.isLoadingMatches.set(true);
    this.hasSearched.set(true);

    this.searchService.getMatches(skillQuery).subscribe({
      next: (matches) => this.processResults(matches),
      error: (err) => {
        console.error("Error en búsqueda:", err);
        this.allCards = [];
        this.updateView();
        this.isLoadingMatches.set(false);
      }
    });
  }

  private processResults(matches: UserSwapDTO[]) {
    this.allCards = matches.map(m => ({
      userId: m.userId,
      userName: m.name,
      userAvatar: m.profilePhotoUrl || 'assets/default-image.jpg',
      skillTitle: m.skillName,      
      skillIcon: m.skillIcon,
      skillImage: this.assignImageToSkill(m.skillCategory, m.skillName),
      distance: m.distance || 'Cerca',
      rating: m.rating || 0,
      isMatch: m.isSwapMatch
    }));

    this.itemsToShow.set(6);
    this.updateView();
    this.isLoadingMatches.set(false);
  }

  private updateView() {
    this.cards.set(this.allCards.slice(0, this.itemsToShow()));
  }

  loadMore() {
    this.itemsToShow.update(val => val + 6); 
    this.updateView(); 
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

  goToSwap(card: CardModel) {
    if (!card.userId) return;

    this.router.navigate(['/swap', card.userId], { 
      queryParams: { skillName: card.skillTitle } 
    });
  }

  hasIntercambio = signal(true);
  isConfirmed = signal(false);

  skillToLearn = signal({
    titulo: 'Clase de Guitarra Acústica',
    img: 'assets/photos_skills/music/guitar.jpg',
    hora: 'Hoy, 18:00h',
    via: 'Vía Napoli 5'
  });

  skillToTeach = signal({
    titulo: 'Taller de Manualidades',
    img: 'assets/photos_skills/leisure/crafts.jpg',
    hora: 'Hoy, 18:00h',
    via: 'Vía Napoli 5'
  });

  toggleIntercambio() {
    this.hasIntercambio.update(v => !v);
    this.isConfirmed.set(false);
  }

  toggleConfirmation() {
    this.isConfirmed.update(v => !v);
  }
}
