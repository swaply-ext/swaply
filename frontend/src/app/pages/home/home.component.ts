import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
  private searchService = inject(SearchService)
  private router = inject(Router);

  cards = signal<CardModel[]>([]); 
  isLoadingMatches = signal(false);
  hasSearched = signal(false); 

  ngOnInit() {
    this.loadInitialRecommendations();
  }

  loadInitialRecommendations() {
    this.searchService.getRecommendations().subscribe({
      next: (matches) => {
        this.updateCards(matches);
        this.isLoadingMatches.set(false);
      },
      error: (err) => {
        console.error("Error cargando recomendaciones:", err);
        this.isLoadingMatches.set(false);
      }
    });
  }

  performMatchSearch(skillQuery: string) {
    console.log("Buscando:", skillQuery);
    this.isLoadingMatches.set(true);
    this.hasSearched.set(true);

    this.searchService.getMatches(skillQuery).subscribe({
      next: (matches) => {
        this.updateCards(matches);
        this.isLoadingMatches.set(false);
      },
      error: (err) => {
        console.error("Error en búsqueda:", err);
        this.cards.set([]); 
        this.isLoadingMatches.set(false);
      }
    });
  }

  private updateCards(matches: UserSwapDTO[]) {
    const mappedCards: CardModel[] = matches.map(m => ({
      userId: m.userId,
      userName: m.name,
      userAvatar: m.profilePhotoUrl || 'assets/default-avatar.png',
      skillTitle: m.skillName, 
      skillIcon: m.skillIcon,   
      distance: m.distance || 'Cerca',
      rating: m.rating || 0,
      isMatch: m.isSwapMatch
    }));
    this.cards.set(mappedCards);
  }

  // Método para navegar al SwapComponent
  goToSwap(card: CardModel) {
    if (!card.userId) return;
    this.router.navigate(['/swap', card.userId]);
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

