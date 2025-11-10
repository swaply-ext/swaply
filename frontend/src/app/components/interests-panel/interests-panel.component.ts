import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Skill {
  name: string;
  level: string;
}
@Component({
  selector: 'app-interests-panel',
  templateUrl: './interests-panel.component.html',
  styleUrls: ['./interests-panel.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class InterestsPanelComponent {
  @Input() isPublic?: boolean;
  @Input() interests: Array<Skill> = [];

  open = false;

  constructor(private router: Router) { }


  togglePanel() {
    this.open = !this.open;
  }

  goToInterests() {
    this.router.navigate(['/interests']);
  }
}
