import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SkillCardComponent } from '../skill-card/skill-card.component';
import { SkillInput } from '../../services/skills.service';

@Component({
  selector: 'app-skills-panel',
  standalone: true,
  imports: [CommonModule, SkillCardComponent],
  templateUrl: './skills-panel.component.html',
  styleUrls: ['./skills-panel.component.css']
})
export class SkillsPanelComponent {
  @Input() SkillInput: Array<SkillInput> = []; 
  @Input() isPublic: boolean = false;
  @Input() editable: boolean = false;
  @Input() title: string = 'Habilidades'; 

  @Input() selectable: boolean = false;
  @Input() selectedSkillId: string = '';
  @Output() skillSelected = new EventEmitter<any>();

  open = true;

  constructor(private router: Router) {}

  get sortedSkills() {
    return [...this.SkillInput].sort((a: any, b: any) => (b.level || 0) - (a.level || 0));
  }

  togglePanel() {
    this.open = !this.open;
  }

  goToSkills() {
    this.router.navigate(['/skills']);
  }

  handleLevelChange(newLevel: any, item: any) {
    item.level = newLevel;
  }

  onSkillSelected(item: any) {
    if (this.selectable) {
      this.skillSelected.emit(item);
    }
  }

  trackByFn(index: number, item: any) {
    return item.id;
  }
}