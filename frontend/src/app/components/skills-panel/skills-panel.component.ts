import { Component, OnChanges, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Skill {
  name: string;
  level: string;
}

@Component({
  selector: 'app-skills-panel',
  templateUrl: './skills-panel.component.html',
  styleUrls: ['./skills-panel.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class SkillsPanelComponent {
  @Input() skills: Array<Skill> = [];

  open = false;

  constructor(private router: Router) { }

  ngOnChanges(): void {
  }

  togglePanel() {
    this.open = !this.open;
  }

  goToSkills() {
    this.router.navigate(['/skills']);
  }
}
