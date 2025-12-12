import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SkillCardComponent } from '../skill-card/skill-card.component';

@Component({
  selector: 'app-swap-skills',
  standalone: true,
  imports: [CommonModule, SkillCardComponent],
  templateUrl: './swap-skills.component.html',
  styleUrls: ['./swap-skills.component.css']
})
export class SwapSkillsComponent {
  @Input() SkillsInput: any[] = [];
  @Input() editable = false;
  @Output() skillSelected = new EventEmitter<any>();

  open = true;

  constructor(private router: Router) {}

  togglePanel() {
    this.open = !this.open;
  }

  handleLevelChange(event: any) {}

  onCardClick(item: any) {
    this.skillSelected.emit(item);
  }
}