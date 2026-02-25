import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

// Componentes
import { AppNavbarComponent } from "../../components/app-navbar/app-navbar.component";
import { SkillSearchComponent } from '../../components/skill-search/skill-search.component';
import { FilterSkillsComponent } from '../../components/filter-skills/filter-skills.component';
import { NextSwapComponent } from '../../components/next-swap/next-swap.component';

// Servicios
import { AccountService } from '../../services/account.service';
import { LocationService } from '../../services/location.service';
import { SearchService } from '../../services/search.services';
import { RedirectionService } from '../../services/redirection.service';
import { PaymentService } from '../../services/payment.service';

// Modelos
import { UserSwapDTO } from '../../models/userSwapDTO.model';

// Tipo extendido para la vista
export type HomeCard = UserSwapDTO & {
  skillImage?: string;
  distance?: string;
};

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

  // --- Inyección de Dependencias ---
  private paymentService = inject(PaymentService);
  private accountService = inject(AccountService);
  private redirectionService = inject(RedirectionService);
  private searchService = inject(SearchService);
  private locationService = inject(LocationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Referencias a los componentes hijos
  @ViewChild('skillSearch') skillSearchComponent?: SkillSearchComponent;
  @ViewChild('filterSkills') filterSkillsComponent?: FilterSkillsComponent;

  // --- Estado y Señales ---
  private myUserId: string = '';
  private currentSearchQuery: string = '';

  // Datos principales
  cards = signal<HomeCard[]>([]);

  // Flags de carga y estado
  isLoadingMatches = signal(false);
  hasSearched = signal(false);

  // Paginación
  private page = signal(0);
  private readonly pageSize = 6;
  canLoadMore = signal(true);

  // --- Mock Data para UI (Demo) ---
  hasIntercambio = signal(true);
  isConfirmed = signal(false);

  ngOnInit() {
    this.redirectionService.checkProfile().subscribe();
    this.paymentService.checkPaymentStatus(() => {});

    this.loadUserProfileAndInitialData();
  }

  private loadUserProfileAndInitialData() {
    this.accountService.getProfileData().subscribe({
      next: (profile: any) => {
        const myUsername = profile?.username;
        if (myUsername) {
          this.searchService.getUserByUsername(myUsername).subscribe({
            next: (userDto) => {
              this.myUserId = userDto.userId;
              this.loadNextPage();
            },
            error: () => this.loadNextPage() // Fallback
          });
        } else {
          this.loadNextPage();
        }
      },
      error: () => this.loadNextPage() // Fallback
    });
  }

  // --- Lógica de Carga de Datos ---

  loadNextPage() {
    this.isLoadingMatches.set(true);
    const serviceCall = this.hasSearched() && this.currentSearchQuery
      ? this.searchService.getMatches(this.currentSearchQuery, this.page(), this.pageSize)
      : this.searchService.getRecommendations(this.page(), this.pageSize);

    serviceCall.subscribe({
      next: (matches) => {
        this.processResults(matches, this.hasSearched());
        this.page.update(p => p + 1);
      },
      error: (err) => {
        console.error("Error cargando datos:", err);
        this.isLoadingMatches.set(false);
        this.canLoadMore.set(false);
      }
    });
  }

  performMatchSearch(skillQuery: string) {
    this.currentSearchQuery = skillQuery;
    this.hasSearched.set(skillQuery.trim() !== '');

    // Resetear estado para nueva búsqueda
    this.page.set(0);
    this.cards.set([]);
    this.canLoadMore.set(true);

    this.loadNextPage();
  }

  private processResults(matches: UserSwapDTO[], calculateDistance: boolean) {
    if (matches.length < this.pageSize) {
      this.canLoadMore.set(false);
    }

    const newCards = matches.map(m => ({
      ...m,
      skillImage: this.assignImageToSkill(m.skillCategory, m.skillName),
      profilePhotoUrl: m.profilePhotoUrl || 'assets/default-image.jpg',
      distance: m.distance || 'Cerca'
    }));

    this.cards.update(currentCards => [...currentCards, ...newCards]);
    this.isLoadingMatches.set(false);

    if (calculateDistance && this.myUserId) {
      this.calculateDistancesForCards(newCards);
    }
  }

  loadMore() {
    if (this.canLoadMore()) {
      this.loadNextPage();
    }
  }

  // --- Cálculo de Distancias ---

  private calculateDistancesForCards(cardsToUpdate: HomeCard[]) {
    cardsToUpdate.forEach(card => {
      if (card.userId === this.myUserId || !card.username) return;

      this.locationService.getDistance(this.myUserId, card.username).subscribe({
        next: (distString) => {
          card.distance = distString;
          // Actualizar la señal para reflejar el cambio de distancia
          this.cards.update(currentCards => [...currentCards]);
        },
        error: (e) => console.error(`Error distancia con ${card.username}`, e)
      });
    });
  }

  // --- Helpers UI / Estilos ---

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

  goToSwap(card: HomeCard) {
    if (!card.username) return;
    this.router.navigate(['/swap', card.username], {
      queryParams: { skillName: card.skillName }
    });
  }

  toggleIntercambio() {
    this.hasIntercambio.update(v => !v);
    this.isConfirmed.set(false);
  }

  toggleConfirmation() {
    this.isConfirmed.update(v => !v);
  }

  // --- Lógica de Imágenes ---

  private assignImageToSkill(category: string, skillName: string): string | undefined {
    const name = skillName ? skillName.toLowerCase() : '';
    let folder = 'leisure';

    if (category) {
        const cat = category.toLowerCase();
        if (cat.includes('deporte') || cat.includes('sports')) folder = 'sports';
        else if (cat.includes('música') || cat.includes('musica')) folder = 'music';
    }

    let filename = '';
    if (name.includes('fútbol') || name.includes('futbol') || name.includes('football')) { filename = 'football.jpg'; folder = 'sports'; }
    else if (name.includes('pádel') || name.includes('padel')) { filename = 'padel.jpg'; folder = 'sports'; }
    else if (name.includes('básquet') || name.includes('basquet') || name.includes('baloncesto') || name.includes('basket')) { filename = 'basketball.jpg'; folder = 'sports'; }
    else if (name.includes('vóley') || name.includes('voley') || name.includes('volley') || name.includes('voleibol')) { filename = 'voleyball.jpg'; folder = 'sports'; }
    else if (name.includes('boxeo') || name.includes('boxing')) { filename = 'boxing.jpg'; folder = 'sports'; }
    else if (name.includes('guitarra') || name.includes('guitar')) { filename = 'guitar.jpg'; folder = 'music'; }
    else if (name.includes('piano')) { filename = 'piano.jpg'; folder = 'music'; }
    else if (name.includes('violín') || name.includes('violin')) { filename = 'violin.jpg'; folder = 'music'; }
    else if (name.includes('batería') || name.includes('bateria') || name.includes('drum')) { filename = 'drums.jpg'; folder = 'music'; }
    else if (name.includes('saxofón') || name.includes('saxofon') || name.includes('sax')) { filename = 'saxophone.jpg'; folder = 'music'; }
    else if (name.includes('dibujo') || name.includes('draw')) { filename = 'draw.jpg'; folder = 'leisure'; }
    else if (name.includes('cocina') || name.includes('cook')) { filename = 'cook.jpg'; folder = 'leisure'; }
    else if (name.includes('baile') || name.includes('dance')) { filename = 'dance.jpg'; folder = 'leisure'; }
    else if (name.includes('manualidades') || name.includes('craft')) { filename = 'crafts.jpg'; folder = 'leisure'; }
    else if (name.includes('digital')) { filename = 'digital_entertainment.jpg'; folder = 'leisure'; }

    return filename ? `assets/photos_skills/${folder}/${filename}` : undefined;
  }

  clearSearch(): void {
    this.skillSearchComponent?.clear();
  }

  clearFilter(): void {
    this.filterSkillsComponent?.clear();
  }

  onSkillSelected(skillId: string): void {
    if (skillId && skillId.trim() !== '') {
      this.clearFilter();
    }
    this.performMatchSearch(skillId);
  }

  onFilterSelected(filterIds: string): void {
    if (filterIds && filterIds.trim() !== '') {
      this.clearSearch();
    }
    this.performMatchSearch(filterIds);
  }
}
