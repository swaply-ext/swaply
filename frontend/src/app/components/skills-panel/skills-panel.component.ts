import { SkillsService } from './../../services/skills.service';
import { Component, OnChanges, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface SkillInput {
  id: string;
  level: number;
}

interface SkillsModel {
  id: string;
  name: string;
  icon: string;
  category: string;
}

export interface SkillDisplay extends SkillsModel {
  level: number;
}

@Component({
  selector: 'app-skills-panel',
  templateUrl: './skills-panel.component.html',
  styleUrls: ['./skills-panel.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class SkillsPanelComponent implements OnChanges {
  @Input() SkillInput: Array<SkillInput> = [];
  
  // SOLUCIÓN: Añadimos el input
  @Input() isReadOnly: boolean = false;

  skills: Array<SkillDisplay> = [];
  open = true;

  constructor(private router: Router, private skillsService: SkillsService) { }

  ngOnChanges(): void {
    if (this.SkillInput && this.SkillInput.length > 0) {
      this.loadAllSkills();
    }
  }

  loadAllSkills() {
    this.skills = [];
    this.SkillInput.forEach(input => {
      this.skillsService.getSkillDisplay(input).subscribe({
        next: (data) => this.skills.push(data),
        error: (e) => console.error(e)
      });
    })
  }

  togglePanel() {
    this.open = !this.open;
  }

  goToSkills() {
    if (!this.isReadOnly) {
      this.router.navigate(['/skills']);
    }
  }
}