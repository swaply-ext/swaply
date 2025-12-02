import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SkillCardComponent } from '../skill-card/skill-card.component';
import { SkillInput } from '../../services/skills.service';

@Component({
  selector: 'app-skills-panel',
  templateUrl: './skills-panel.component.html',
  styleUrls: ['./skills-panel.component.css'],
  standalone: true,
  imports: [CommonModule, SkillCardComponent]
})
export class SkillsPanelComponent {
  @Input() SkillInput: Array<SkillInput> = [];

  open = true;

  constructor(private router: Router) {}

  togglePanel() {
    this.open = !this.open;
  }

  goToSkills() {
    this.router.navigate(['/skills']);
  }

  handleLevelChange(event: {id: string, newLevel: number}) {
  console.log(`Guardar en BD: ID ${event.id} ahora es nivel ${event.newLevel}`);
  // Aquí llamarías a un servicio para guardar
}
}
