import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

// Componentes
import { AppNavbarComponent } from "../../components/app-navbar/app-navbar.component";
import { SkillSearchComponent } from '../../components/skill-search/skill-search.component';
import { FilterSkillsComponent } from '../../components/filter-skills/filter-skills.component';
import { NextSwapComponent } from '../../components/next-swap/next-swap.component';
import { InlineLoaderComponent } from '../../components/inline-loader/inline-loader.component';

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
    RouterLink,
    InlineLoaderComponent // 👇 Lo añadimos a los imports
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

  // Datos principales
  private allCards: HomeCard[] = []; // Fuente de verdad completa
  cards = signal<HomeCard[]>([]);    // Lo que se muestra en pantalla (reactivo)

  // Flags de carga y estado
  isLoadingMatches = signal(false);
  hasSearched = signal(false);

  // Paginación / Scroll infinito
  itemsToShow = signal(6);
  canLoadMore = computed(() => this.cards().length < this.allCards.length);

  // --- Mock Data para UI (Demo) ---
  showSwap = signal(true);
  isConfirmed = signal(false);

  ngOnInit() {
    // 1. Verificación de perfil y pagos (Fire & Forget - Segundo plano)
    // Esto asegura que la lógica de negocio se ejecute sin bloquear la carga visual de usuarios
    this.redirectionService.checkProfile().subscribe();

    this.paymentService.checkPaymentStatus((isLoading: boolean) => {
      // Opcional: Si quieres que el spinner dependa del pago, descomenta esto,
      // pero para que funcione como el V2, mejor controlamos el loading en la carga de datos.
      // this.isLoadingMatches.set(isLoading);
    });

    // 2. CARGA PRINCIPAL DE DATOS (Igual que en la versión que funciona)
    // Se ejecuta inmediatamente al iniciar.
    this.loadUserProfileAndRecommendations();
  }

  private loadUserProfileAndRecommendations() {
    this.accountService.getProfileData().subscribe({
      next: (profile: any) => {
        const myUsername = profile?.username;
        if (myUsername) {
          this.searchService.getUserByUsername(myUsername).subscribe({
            next: (userDto) => {
              this.myUserId = userDto.userId;
              this.loadInitialRecommendations();
            },
            error: () => this.loadInitialRecommendations() // Fallback
          });
        } else {
          this.loadInitialRecommendations();
        }
      },
      error: () => this.loadInitialRecommendations() // Fallback
    });
  }

  // --- Lógica de Búsqueda y Recomendaciones ---

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

  private updateView() {
    // Actualizamos la señal con una copia del array para disparar la detección de cambios
    this.cards.set([...this.allCards.slice(0, this.itemsToShow())]);
  }

  loadMore() {
    this.itemsToShow.update(val => val + 6);
    this.updateView();
  }

  // --- Cálculo de Distancias ---

  private calculateDistancesForCards() {
    this.allCards.forEach(card => {
      // No calcular distancia con uno mismo
      if (card.userId === this.myUserId) return;

      if (card.username) {
        this.locationService.getDistance(this.myUserId, card.username).subscribe({
          next: (distString) => {
            card.distance = distString;
            // Importante: Actualizar la vista después de recibir el dato asíncrono
            this.updateView();
          },
          error: (e) => console.error(`Error distancia con ${card.username}`, e)
        });
      }
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
    this.showSwap.update(v => !v);
    this.isConfirmed.set(false);
  }

  toggleConfirmation() {
    this.isConfirmed.update(v => !v);
  }

  // --- Lógica de Imágenes ---

  private assignImageToSkill(category: string, skillName: string): string | undefined {
    const name = skillName ? skillName.toLowerCase() : '';
    let folder = 'leisure';

    // Determinar carpeta base por categoría
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
