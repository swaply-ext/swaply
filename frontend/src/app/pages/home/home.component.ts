import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AppNavbarComponent } from "../../components/app-navbar/app-navbar.component";
import { SkillSearchComponent } from '../../components/skill-search/skill-search.component'; 
import { FilterSkillsComponent } from '../../components/filter-skills/filter-skills.component';
import { AccountService } from '../../services/account.service';
import { LocationService } from '../../services/location.service';
import { SearchService } from '../../services/search.services';
import { NextSwapComponent } from '../../components/next-swap/next-swap.component';
import { NextSwap } from '../../models/next-swap.model';
import { UserSwapDTO } from '../../models/userSwapDTO.model'; 


export type HomeCard = UserSwapDTO & { skillImage?: string };

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    AppNavbarComponent,
    SkillSearchComponent,
    FilterSkillsComponent,
    NextSwapComponent,
    RouterLink
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {

  constructor(private accountService: AccountService) { }

  private searchService = inject(SearchService);
  private locationService = inject(LocationService);
  private router = inject(Router);

  // Referencias a los componentes hijos
  @ViewChild('skillSearch') skillSearchComponent?: SkillSearchComponent;
  @ViewChild('filterSkills') filterSkillsComponent?: FilterSkillsComponent;

  private myUserId: string = '';

  private allCards: HomeCard[] = []; 
  cards = signal<HomeCard[]>([]);

  isLoadingMatches = signal(false);
  hasSearched = signal(false); 
  
  itemsToShow = signal(6);
  canLoadMore = computed(() => this.cards().length < this.allCards.length);

  ngOnInit() {
    this.accountService.getProfileData().subscribe({
      next: (profile: any) => {
        const myUsername = profile.username;
        if (myUsername) {
            this.searchService.getUserByUsername(myUsername).subscribe({
                next: (userDto) => {
                    this.myUserId = userDto.userId;
                    this.loadInitialRecommendations();
                },
                error: () => this.loadInitialRecommendations()
            });
        } else {
            this.loadInitialRecommendations();
        }
      },
      error: () => this.loadInitialRecommendations()
    });
  }

  loadInitialRecommendations() {
    this.isLoadingMatches.set(true); 
    this.hasSearched.set(false);

    this.searchService.getRecommendations().subscribe({
      next: (matches) => this.processResults(matches, false),
      error: (err) => {
        console.error("Error cargando recomendaciones:", err);
        this.isLoadingMatches.set(false);
      }
    });
  }

  performMatchSearch(skillQuery: string) {
    if (!skillQuery || skillQuery.trim() === '') {
      this.loadInitialRecommendations();
      return;
    }

    this.isLoadingMatches.set(true);
    this.hasSearched.set(true);

    this.searchService.getMatches(skillQuery).subscribe({
      next: (matches) => this.processResults(matches, true),
      error: (err) => {
        console.error("Error en búsqueda:", err);
        this.allCards = [];
        this.updateView();
        this.isLoadingMatches.set(false);
      }
    });
  }
  
  private processResults(matches: UserSwapDTO[], calculateDistance: boolean) {
    this.allCards = matches.map(m => ({
      ...m, 
      
      skillImage: this.assignImageToSkill(m.skillCategory, m.skillName),
      
      profilePhotoUrl: m.profilePhotoUrl || 'assets/default-image.jpg',
      distance: m.distance || 'Cerca'
    }));

    this.itemsToShow.set(6);
    this.updateView(); 
    this.isLoadingMatches.set(false);

    if (calculateDistance && this.myUserId) {
        this.calculateDistancesForCards();
    }
  }

  getLevelLabel(level: number): string {
    switch(level) {
      case 1: return 'Principiante';
      case 2: return 'Intermedio';
      case 3: return 'Experto';
      default: return 'Nivel ' + level;
    }
  }

  getLevelClass(level: number | undefined): string {
    if (!level) return 'level-default';
    switch(level) {
        case 1: return 'level-1';
        case 2: return 'level-2';
        case 3: return 'level-3';
        default: return 'level-default';
    }
  }

  private calculateDistancesForCards() {
    this.allCards.forEach(card => {
      if (card.userId === this.myUserId) return;

      if (card.username) {
          this.locationService.getDistance(this.myUserId, card.username).subscribe({
            next: (distString) => {
              card.distance = distString; 
              this.updateView(); 
            },
            error: (e) => console.error(`Error distancia con ${card.username}`, e)
          });
      }
    });
  }

  private updateView() {
    this.cards.set([...this.allCards.slice(0, this.itemsToShow())]);
  }

  loadMore() {
    this.itemsToShow.update(val => val + 6); 
    this.updateView(); 
  }

  // --- IMÁGENES ---
  private assignImageToSkill(category: string, skillName: string): string | undefined {
    const name = skillName ? skillName.toLowerCase() : '';
    let folder = 'leisure';
    if (category) {
        const cat = category.toLowerCase();
        if (cat.includes('deporte') || cat.includes('sports')) folder = 'sports';
        else if (cat.includes('música') || cat.includes('musica')) folder = 'music';
    }

    let filename = '';
    // Deportes
    if (name.includes('fútbol') || name.includes('futbol') || name.includes('football')) { filename = 'football.jpg'; folder = 'sports'; }
    else if (name.includes('pádel') || name.includes('padel')) { filename = 'padel.jpg'; folder = 'sports'; }
    else if (name.includes('básquet') || name.includes('basquet') || name.includes('baloncesto') || name.includes('basket')) { filename = 'basketball.jpg'; folder = 'sports'; }
    else if (name.includes('vóley') || name.includes('voley') || name.includes('volley') || name.includes('voleibol')) { filename = 'voleyball.jpg'; folder = 'sports'; }
    else if (name.includes('boxeo') || name.includes('boxing')) { filename = 'boxing.jpg'; folder = 'sports'; }
    // Música
    else if (name.includes('guitarra') || name.includes('guitar')) { filename = 'guitar.jpg'; folder = 'music'; }
    else if (name.includes('piano')) { filename = 'piano.jpg'; folder = 'music'; }
    else if (name.includes('violín') || name.includes('violin')) { filename = 'violin.jpg'; folder = 'music'; }
    else if (name.includes('batería') || name.includes('bateria') || name.includes('drum')) { filename = 'drums.jpg'; folder = 'music'; }
    else if (name.includes('saxofón') || name.includes('saxofon') || name.includes('sax')) { filename = 'saxophone.jpg'; folder = 'music'; }
    // Ocio
    else if (name.includes('dibujo') || name.includes('draw')) { filename = 'draw.jpg'; folder = 'leisure'; }
    else if (name.includes('cocina') || name.includes('cook')) { filename = 'cook.jpg'; folder = 'leisure'; }
    else if (name.includes('baile') || name.includes('dance')) { filename = 'dance.jpg'; folder = 'leisure'; }
    else if (name.includes('manualidades') || name.includes('craft')) { filename = 'crafts.jpg'; folder = 'leisure'; }
    else if (name.includes('digital')) { filename = 'digital_entertainment.jpg'; folder = 'leisure'; }

    return filename ? `assets/photos_skills/${folder}/${filename}` : undefined;
  }
  
  goToSwap(card: HomeCard) { 
    if (!card.username) return;
    this.router.navigate(['/swap', card.username], {
      queryParams: { skillName: card.skillName }
    });
  }

  hasIntercambio = signal(true);
  isConfirmed = signal(false);
  skillToLearn = signal({ titulo: 'Clase de Guitarra Acústica', img: 'assets/photos_skills/music/guitar.jpg', hora: 'Hoy, 18:00h', via: 'Vía Napoli 5' });
  skillToTeach = signal({ titulo: 'Taller de Manualidades', img: 'assets/photos_skills/leisure/crafts.jpg', hora: 'Hoy, 18:00h', via: 'Vía Napoli 5' });

  toggleIntercambio() { this.hasIntercambio.update(v => !v); this.isConfirmed.set(false); }
  toggleConfirmation() { this.isConfirmed.update(v => !v); }

  // Método para limpiar el search cuando se usa el filtro
  clearSearch(): void {
    this.skillSearchComponent?.clear();
  }

  // Método para limpiar el filtro cuando se usa el search
  clearFilter(): void {
    this.filterSkillsComponent?.clear();
  }

  // Handler para cuando se selecciona una habilidad del search
  onSkillSelected(skillId: string): void {
    // Solo clear el filtro si hay un skillId válido (no vacío)
    if (skillId && skillId.trim() !== '') {
      this.clearFilter();
    }
    this.performMatchSearch(skillId);
  }

  // Handler para cuando se selecciona un filtro
  onFilterSelected(filterIds: string): void {
    // Solo clear el search si hay un filtro válido (no vacío)
    if (filterIds && filterIds.trim() !== '') {
      this.clearSearch();
    }
    this.performMatchSearch(filterIds);
  }
}
