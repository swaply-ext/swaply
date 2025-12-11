import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../services/account.service';

interface profileToTeach {
  profilePhotoUrl: string;
  location: string;
  username: string;
}
interface profileToLearn {
  profilePhotoUrl: string;
  date: string;
  location: string;
  username: string;
}

@Component({
  selector: 'app-next-swap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './next-swap.component.html',
  styleUrl: './next-swap.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NextSwapComponent {
  constructor(private accountService: AccountService) { }

  hasIntercambio = signal(true);
  isConfirmed = signal(false);

  skillToLearn = signal({
    titulo: 'Clase de Guitarra Acústica',
    img: 'assets/photos_skills/music/guitar.jpg',
    hora: 'Hoy, 18:00h',
    via: 'Vía Napoli 5',
    user: '@arnaldo05asdasdasdasd'
  });

  skillToTeach = signal({
    titulo: 'Taller de Manualidades',
    img: 'assets/photos_skills/leisure/crafts.jpg',
    hora: 'Hoy, 18:00h',
    via: 'Vía Napoli 5',
    user: '@pepe'

  });
  // --- FUNCIONES DE LOS BOTONES ---
  toggleIntercambio() {
    this.hasIntercambio.update(value => !value);
    this.isConfirmed.set(false);
  }

  toggleConfirmation() {
    this.isConfirmed.update(value => !value);
  }
  toggleDeny() {
    this.isConfirmed.set(false);
  }

}
