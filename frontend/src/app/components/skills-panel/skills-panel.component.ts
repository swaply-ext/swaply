import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkillCardComponent } from '../skill-card/skill-card.component';

@Component({
  selector: 'app-skills-panel',
  standalone: true,
  imports: [CommonModule, SkillCardComponent],
  templateUrl: './skills-panel.component.html',
  styleUrls: ['./skills-panel.component.css']
})
export class SkillsPanelComponent {
  // Inputs normales
  @Input() SkillInput: any[] = [];
  @Input() isPublic: boolean = false;
  @Input() editable: boolean = false;
  
  // NUEVO: Título dinámico
  @Input() title: string = 'Habilidades'; 

  // Inputs/Outputs del modo Swap
  @Input() selectable: boolean = false;
  @Input() selectedSkillId: string = '';
  @Output() skillSelected = new EventEmitter<any>();

  open = true;

  get displaySkills() {
    return this.SkillInput;
  }

  togglePanel() {
    this.open = !this.open;
  }

  handleLevelChange(event: any) {
  }

  onSkillSelected(skill: any) {
    this.skillSelected.emit(skill);
  }

  trackByFn(index: number, item: any) {
    return item.id || item.name;
  }
}