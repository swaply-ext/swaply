import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNavbarComponent } from "../../components/app-navbar/app-navbar.component";

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule,AppNavbarComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePageComponent {

  hasIntercambio = signal(true);
  isConfirmed = signal(false);

  // --- DATOS PARA "PRÓXIMO INTERCAMBIO" ---
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

  // --- FUNCIONES DE LOS BOTONES ---
  toggleIntercambio() {
    this.hasIntercambio.update(value => !value);
    this.isConfirmed.set(false);
  }

  toggleConfirmation() {
    this.isConfirmed.update(value => !value);
  }

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
      titulo: 'Partido de Pádel',
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