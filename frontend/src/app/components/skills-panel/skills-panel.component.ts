import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
// Importamos el hijo
import { SkillCardComponent } from '../skill-card/skill-card.component';
// Importamos la interfaz compartida desde el servicio
import { SkillInput } from '../../services/skills.service';

@Component({
  selector: 'app-skills-panel',
  templateUrl: './skills-panel.component.html',
  styleUrls: ['./skills-panel.component.css'],
  standalone: true,
  // ¡Importante! Añadir SkillCardComponent a los imports
  imports: [CommonModule, SkillCardComponent]
})
export class SkillsPanelComponent {
  // Recibimos solo la lista de IDs y niveles (data ligera)
  @Input() SkillInput: Array<SkillInput> = [];

  open = true;

  constructor(private router: Router) {
    // Ya no necesitamos inyectar el SkillsService aquí
  }

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
