import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNavbarComponent } from "../../components/app-navbar/app-navbar.component";
import { SkillSearchComponent } from '../../components/skill-search/skill-search.component'; 
import { FilterSkillsComponent } from '../../components/filter-skills/filter-skills.component';
import { SearchService, UserSwapDTO } from '../../services/search.services';
import { RouterLink } from '@angular/router';
import { AccountService } from '../../services/account.service';

export interface CardModel {
  userId?: string;
  username?: string; //per la ruta /public-profile/:username
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
  imports: [CommonModule,AppNavbarComponent, SkillSearchComponent, FilterSkillsComponent, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {

  constructor(private accountService: AccountService) { }

  
  private searchService = inject(SearchService);

  private allCards: CardModel[] = []; 
  cards = signal<CardModel[]>([]);
  
  isLoadingMatches = signal(false);
  
  // Esta bandera controla si mostramos las etiquetas de estado o no
  hasSearched = signal(false);
  
  itemsToShow = signal(6);
  canLoadMore = computed(() => this.cards().length < this.allCards.length);

  ngOnInit() {
    this.loadInitialRecommendations();
  }

  loadInitialRecommendations() {
    this.isLoadingMatches.set(true);
    // Resetear hasSearched a false para que el HTML sepa que son recomendaciones 
    this.hasSearched.set(false); 
    
    this.searchService.getRecommendations().subscribe({
      next: (matches) => {
        this.processResults(matches);
      },
      error: (err) => {
        console.error("Error:", err);
        this.isLoadingMatches.set(false);
      }
    });
  }

  performMatchSearch(skillQuery: string) {
    if (!skillQuery || skillQuery.trim() === '') {
        this.loadInitialRecommendations();
        return;
    }

    console.log("Buscando:", skillQuery);
    this.isLoadingMatches.set(true);
    // Marcamos true para que el HTML active las etiquetas de estado
    this.hasSearched.set(true);

    this.searchService.getMatches(skillQuery).subscribe({
      next: (matches) => {
        this.processResults(matches);
      },
      error: (err) => {
        console.error("Error:", err);
        this.allCards = [];
        this.updateView();
        this.isLoadingMatches.set(false);
      }
    });
  }
  
  private processResults(matches: UserSwapDTO[]) {
    this.allCards = matches.map(m => ({
      userId: m.userId,
      username: (m as any).username || m.userId,
      userName: m.name,
      userAvatar: m.profilePhotoUrl || 'assets/default-image.jpg',
      skillTitle: m.skillName, 
      skillIcon: m.skillIcon,   
      skillImage: this.assignImageToSkill(m.skillCategory, m.skillName), 
      distance: m.distance,
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

  // ... (assignImageToSkill y lógica de toggles igual que antes) ...
  private assignImageToSkill(category: string, skillName: string): string | undefined {
      // (Copia aquí el contenido de la función assignImageToSkill que ya tenías)
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
      else if (name.includes('dibujo')) { filename = 'draw.jpg'; folder = 'leisure'; }
      else if (name.includes('cocina')) { filename = 'cook.jpg'; folder = 'leisure'; }
      else if (name.includes('baile') || name.includes('dance')) { filename = 'dance.jpg'; folder = 'leisure'; }
      else if (name.includes('manualidades') || name.includes('craft')) { filename = 'crafts.jpg'; folder = 'leisure'; }
      else if (name.includes('digital')) { filename = 'digital_entertainment.jpg'; folder = 'leisure'; }
      return filename ? `assets/photos_skills/${folder}/${filename}` : undefined;
  }
  
  hasIntercambio = signal(true);
  isConfirmed = signal(false);
  skillToLearn = signal({ titulo: 'Clase de Guitarra Acústica', img: 'assets/photos_skills/music/guitar.jpg', hora: 'Hoy, 18:00h', via: 'Vía Napoli 5' });
  skillToTeach = signal({ titulo: 'Taller de Manualidades', img: 'assets/photos_skills/leisure/crafts.jpg', hora: 'Hoy, 18:00h', via: 'Vía Napoli 5' });

  toggleIntercambio() { this.hasIntercambio.update(v => !v); this.isConfirmed.set(false); }
  toggleConfirmation() { this.isConfirmed.update(v => !v); }
}