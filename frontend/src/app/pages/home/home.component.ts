import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNavbarComponent } from "../../components/app-navbar/app-navbar.component";
import { SkillSearchComponent } from '../../components/skill-search/skill-search.component'; 
import { FilterSkillsComponent } from '../../components/filter-skills/filter-skills.component';
import { AccountService } from '../../services/account.service';
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
  imports: [CommonModule,AppNavbarComponent, SkillSearchComponent, FilterSkillsComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  private searchService = inject(SearchService);

  private allCards: CardModel[] = []; 
  cards = signal<CardModel[]>([]);

  isLoadingMatches = signal(false);
  hasSearched = signal(false); 

  itemsToShow = signal(6);

  // Computed para saber si mostrar el botón "Ver Más"
  // (Si lo que mostramos es menos que el total, significa que quedan más)
  canLoadMore = computed(() => this.cards().length < this.allCards.length);

  ngOnInit() {
    this.loadInitialRecommendations();
  }

  loadInitialRecommendations() {
    this.isLoadingMatches.set(true); 
    this.searchService.getRecommendations().subscribe({
      next: (matches) => {
        this.processResults(matches);
      },
      error: (err) => {
        console.error("Error cargando recomendaciones:", err);
        this.isLoadingMatches.set(false);
      }
    });
  }

  performMatchSearch(skillQuery: string) {
    //si esta vacío, vuelve a las recomendaciones
    if (!skillQuery || skillQuery.trim() === '') {
      this.hasSearched.set(false); 
      this.loadInitialRecommendations();
      return;
    }

    console.log("Buscando:", skillQuery);
    this.isLoadingMatches.set(true);
    this.hasSearched.set(true);

    this.searchService.getMatches(skillQuery).subscribe({
      next: (matches) => {
        this.processResults(matches);
      },
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
    const name = skillName ? skillName.toLowerCase() : '';
    let folder = 'leisure';
    
    if (category) {
        const cat = category.toLowerCase();
        if (cat.includes('deporte') || cat.includes('sports')) folder = 'sports';
        if (cat.includes('música') || cat.includes('musica')) folder = 'music';
    }

    let filename = '';

    if (name.includes('fútbol') || name.includes('futbol')) { filename = 'football.jpg'; folder = 'sports'; }
    else if (name.includes('pádel') || name.includes('padel')) { filename = 'padel.jpg'; folder = 'sports'; }
    else if (name.includes('basquet') || name.includes('baloncesto') || name.includes('basket')) { filename = 'basketball.jpg'; folder = 'sports'; }
    else if (name.includes('vóley') || name.includes('voley')) { filename = 'voleyball.jpg'; folder = 'sports'; }
    else if (name.includes('boxeo')) { filename = 'boxing.jpg'; folder = 'sports'; }

    else if (name.includes('guitarra')) { filename = 'guitar.jpg'; folder = 'music'; }
    else if (name.includes('piano')) { filename = 'piano.jpg'; folder = 'music'; }
    else if (name.includes('violín') || name.includes('violin')) { filename = 'violin.jpg'; folder = 'music'; }
    else if (name.includes('batería') || name.includes('bateria')) { filename = 'drums.jpg'; folder = 'music'; }
    else if (name.includes('saxofón') || name.includes('saxofon')) { filename = 'saxophone.jpg'; folder = 'music'; }

    else if (name.includes('dibujo')) { filename = 'draw.jpg'; folder = 'leisure'; }
    else if (name.includes('cocina')) { filename = 'cook.jpg'; folder = 'leisure'; }
    else if (name.includes('baile') || name.includes('dance')) { filename = 'dance.jpg'; folder = 'leisure'; }
    else if (name.includes('manualidades')) { filename = 'crafts.jpg'; folder = 'leisure'; }
    else if (name.includes('digital')) { filename = 'digital_entertainment.jpg'; folder = 'leisure'; }

    if (filename) {
      return `assets/photos_skills/${folder}/${filename}`;
    }

    return undefined;
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

