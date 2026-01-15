import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkillCardComponent } from '../skill-card/skill-card.component';
import { SkillDisplay } from '../../models/skills.models';
import { UserSwap } from '../../models/user.models';





@Component({
  selector: 'app-swap-interests',
  standalone: true,
  imports: [CommonModule, SkillCardComponent],
  templateUrl: './swap-interests.component.html',
  styleUrls: ['./swap-interests.component.css']
})
export class SwapInterestsComponent {
  @Input() InterestsInput: SkillDisplay[] = [];
  @Input() editable = false;
  @Input() targetUser!: UserSwap;
  @Output() skillSelected = new EventEmitter<{ skill: SkillDisplay }>();

  open = true;

  togglePanel() {
    this.open = !this.open;
  }

  handleLevelChange(event: any, item: SkillDisplay) {
    item.level = event;
    console.log('Nivel cambiado:', item.name, item.level);
  }

  onCardClick(item: SkillDisplay) {
    this.skillSelected.emit({ skill: item });
  }

  trackByInterest(index: number, interest: any) {
  return interest.id || interest.name; 
}

}