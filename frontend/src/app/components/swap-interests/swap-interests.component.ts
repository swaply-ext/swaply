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
  @Output() skillSelected = new EventEmitter<any>();

  open = true;

  togglePanel() {
    this.open = !this.open;
  }

  handleLevelChange(event: any) {
    console.log('Nivel cambiado:', event);
  }

  onCardClick(item: any) {
    this.skillSelected.emit(item);
  }

  trackByInterest(index: number, interest: any) {
  return interest.id || interest.name; 
}

}