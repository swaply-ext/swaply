import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SkillCardComponent } from '../skill-card/skill-card.component';
import { SkillInput } from '../../services/skills.service';

@Component({
  selector: 'app-interests-panel',
  templateUrl: './interests-panel.component.html',
  styleUrls: ['./interests-panel.component.css'],
  standalone: true,
  imports: [CommonModule, SkillCardComponent]
})
export class InterestsPanelComponent implements OnChanges {
  @Input() InterestsInput: Array<SkillInput> = [];
  @Input() editable: boolean = false;

  open = true;

  constructor(private router: Router) {}

  togglePanel() {
    this.open = !this.open;
  }

  goToInterests() {
    if (!this.isReadOnly) {
      this.router.navigate(['/interests']);
    }
  }

  handleLevelChange(event: {id: string, newLevel: number}) {
  console.log(`Guardar en BD: ID ${event.id} ahora es nivel ${event.newLevel}`);
  // Aquí llamarías a un servicio para guardar
}
}
