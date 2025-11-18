import { Component, OnChanges, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';



interface SkillInput {
  id: string;
  level: string;
}

interface Skills {
  id: string;
  name: string;
  icon: string;
  category: string;
}

@Component({
  selector: 'app-skills-panel',
  templateUrl: './skills-panel.component.html',
  styleUrls: ['./skills-panel.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class SkillsPanelComponent {
  @Input() SkillInput: Array<SkillInput> = [];

skills = [
  { name: 'OCIO DIGITAL', icon: '🖥️', level: 1, category: 'tech' },
  { name: 'DIBUJO', icon: '🖌️', level: 1, category: 'art' },
  { name: 'PADEL', icon: '🎾', level: 3, category: 'sport' }, // Nivel 3 será morado
  { name: 'BATERÍA', icon: '🥁', level: 1, category: 'music' }
];

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
