import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-interests-panel',
  templateUrl: './interests-panel.component.html',
  styleUrls: ['./interests-panel.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class InterestsPanelComponent {

  open = false;
  interests = ['Cantar', 'Bailar', 'Programar', 'Dibujar', 'Cocinar'];

  constructor(private router: Router) {}

  togglePanel() {
    this.open = !this.open;
  }

  goToInterests() {
    this.router.navigate(['/interests']);
  }
}
