import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
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
export class InterestsPanelComponent {
  @Input() InterestsInput: Array<SkillInput> = [];
  @Input() editable: boolean = false;
  @Input() isPublic: boolean = false;

  open = true;

  sortedSkills: Array<SkillInput> = [];

  constructor(private router: Router) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['InterestsInput']) {
      this.sortSkills();
    }
  }

  private sortSkills(){
    this.sortedSkills = [...this.InterestsInput].sort((a,b) => b.level -a.level);
  }


  togglePanel() {
    this.open = !this.open;
  }

  goToInterests() {
    this.router.navigate(['/interests'], { queryParams: { source: 'profile' } });
  }

  handleLevelChange(event: {id: string, newLevel: number}) {
  console.log(`Guardar en BD: ID ${event.id} ahora es nivel ${event.newLevel}`);
  // Aquí llamarías a un servicio para guardar
}
}
