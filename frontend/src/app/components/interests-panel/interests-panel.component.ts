import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface SkillInput {
  id: string;
  level: number;
}
@Component({
  selector: 'app-interests-panel',
  templateUrl: './interests-panel.component.html',
  styleUrls: ['./interests-panel.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class InterestsPanelComponent {
  @Input() InterestsInput: Array<SkillInput> = [];

  open = false;

  constructor(private router: Router) { }


  togglePanel() {
    this.open = !this.open;
  }

  goToInterests() {
    this.router.navigate(['/interests']);
  }
}
