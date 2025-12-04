import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SkillsService } from '../../services/skills.service';

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
  selector: 'app-interests-panel',
  templateUrl: './interests-panel.component.html',
  styleUrls: ['./interests-panel.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class InterestsPanelComponent implements OnChanges {
  @Input() InterestsInput: Array<SkillInput> = [];
  
  
  @Input() isReadOnly: boolean = false;

  skills: Array<SkillDisplay> = [];
  open = true;

  constructor(private router: Router, private skillsService: SkillsService) { }

  ngOnChanges(): void {
    if (this.InterestsInput && this.InterestsInput.length > 0) {
      this.loadAllSkills();
    }
  }

  loadAllSkills() {
    this.skills = [];
    this.InterestsInput.forEach(input => {
      this.skillsService.getSkillDisplay(input).subscribe({
        next: (data) => this.skills.push(data),
        error: (e) => console.error(e)
      });
    })
  }

  togglePanel() {
    this.open = !this.open;
  }

  goToInterests() {
    if (!this.isReadOnly) {
      this.router.navigate(['/interests']);
    }
  }
}