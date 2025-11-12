import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-skills-panel',
  templateUrl: './skills-panel.component.html',
  styleUrls: ['./skills-panel.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class SkillsPanelComponent {

  open = false;
  skills = ['Cantar', 'Bailar', 'Programar', 'Dibujar', 'Cocinar'];

  constructor(private router: Router) {}

  togglePanel() {
    this.open = !this.open;
  }

  goToSkills() {
    this.router.navigate(['/skills']);
  }
}
