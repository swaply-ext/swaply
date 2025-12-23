import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwapListComponent } from '../../components/swap-list/swap-list.component';
// Asumo que tienes un Navbar o Sidebar, si no, omite esta importación
// import { NavbarComponent } from '../../components/navbar/navbar.component'; 

@Component({
  selector: 'app-my-swaps-page',
  standalone: true,
  // Importamos el componente de la lista que creamos antes
  imports: [CommonModule, SwapListComponent], 
  template: `
    <main class="page-container">
      <div class="content-wrapper">
        <app-swap-list></app-swap-list>
      </div>
    </main>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: var(--bg-app); /* O el color de fondo general de tu app */
    }

    .page-container {
      display: flex;
      justify-content: center;
      padding: 2rem 1rem;
      width: 100%;
      box-sizing: border-box;
    }

    .content-wrapper {
      width: 100%;
      max-width: 1000px; /* Ancho máximo para que no se estire demasiado en pantallas grandes */
      margin: 0 auto;
    }

    /* Ajustes responsive */
    @media (max-width: 768px) {
      .page-container {
        padding: 1rem 0.5rem;
      }
    }
  `]
})
export class MySwapsPageComponent {
  // No necesita lógica, solo actúa de contenedor
}