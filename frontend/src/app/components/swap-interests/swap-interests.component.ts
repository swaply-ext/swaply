import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkillCardComponent } from '../skill-card/skill-card.component';

export interface Interest {
  id?: string;
  name: string;
  selected?: boolean;
  image?: string;
  level?: number;
}

export interface User {
  username: string;
  skills?: Interest[];
}

@Component({
  selector: 'app-swap-interests',
  standalone: true,
  imports: [CommonModule, SkillCardComponent],
  templateUrl: './swap-interests.component.html',
  styleUrls: ['./swap-interests.component.css']
})
export class SwapInterestsComponent {
  @Input() InterestsInput: Interest[] = [];
  @Input() editable = false;
  @Input() targetUser: User | null = null;
  @Output() skillSelected = new EventEmitter<{ skill: Interest }>();

  open = true;

  togglePanel() {
    this.open = !this.open;
  }

  handleLevelChange(event: any, item: Interest) {
    item.level = event;
    console.log('Nivel cambiado:', item.name, item.level);
  }

  onCardClick(item: Interest) {
    this.skillSelected.emit({ skill: item });
  }
}