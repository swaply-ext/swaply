import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNavbarComponent } from "../../components/app-navbar/app-navbar.component";
import { SkillSearchComponent } from '../../components/skill-search/skill-search.component';
import { FilterSkillsComponent } from '../../components/filter-skills/filter-skills.component';
import { AccountService } from '../../services/account.service';
import { NextSwapComponent } from '../../components/next-swap/next-swap.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    AppNavbarComponent, 
    SkillSearchComponent, 
    FilterSkillsComponent,
    NextSwapComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {

  constructor(private accountService: AccountService) { }


  // --- DATOS DE EJEMPLO PARA "INTERCAMBIOS CERCA DE TI" ---
  intercambiosCerca = signal([
    {
      user: 'Juan Pérez',
      userImg: 'assets/people_demo/juan_perez.png',
      img: 'assets/photos_skills/sports/basketball.jpg',
      titulo: 'Clase de Baloncesto',
      distancia: 'A 1.2 km',
      rating: 4.8,
    },
    {
      user: 'Maria García',
      userImg: 'assets/people_demo/marina_garcia.jpg',
      img: 'assets/photos_skills/leisure/cook.jpg',
      titulo: 'Clase de Cocina Italiana',
      distancia: 'A 0.8 km',
      rating: 4.9,
    },
    {
      user: 'Carlos R.',
      userImg: 'assets/people_demo/carlos_rodriguez.jpg',
      img: 'assets/photos_skills/music/drums.jpg',
      titulo: 'Clase de Batería',
      distancia: 'A 2.5 km',
      rating: 4.7,
    },
    {
      user: 'Ana López',
      userImg: 'assets/people_demo/ana_lopez.jpg',
      img: 'assets/photos_skills/sports/padel.jpg',
      titulo: 'Clase de Pádel',
      distancia: 'A 1.1 km',
      rating: 4.8,
    },
    {
      user: 'Luis Martín',
      userImg: 'assets/people_demo/luis_martin.jpg',
      img: 'assets/photos_skills/music/piano.jpg',
      titulo: 'Clase de Piano',
      distancia: 'A 3.0 km',
      rating: 4.6,
    },
    {
      user: 'Elena F.',
      userImg: 'assets/people_demo/elena_figuera.jpg',
      img: 'assets/photos_skills/leisure/draw.jpg',
      titulo: 'Taller de Dibujo',
      distancia: 'A 1.8 km',
      rating: 4.9,
    },
  ]);

}