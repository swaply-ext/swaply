import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwapListComponent } from '../../components/swap-list/swap-list.component';

@Component({
  selector: 'app-my-swaps-page',
  standalone: true,
  imports: [CommonModule, SwapListComponent],
  templateUrl: './my-swaps.component.html',
  styleUrl: './my-swaps.component.css'
})
export class MySwapsPageComponent {
  // Lógica del componente (vacía por ahora, solo es contenedor)
}
export class AppNavbarComponent0 {
  // Lógica del componente (vacía por ahora, solo es contenedor)
}