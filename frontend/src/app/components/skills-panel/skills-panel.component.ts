import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-skills-panel',
  templateUrl: './skills-panel.component.html',
  styleUrls: ['./skills-panel.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class SkillsPanelComponent {
  open = false;
  showInput = false;
  newSkill = '';
  skills = ['JavaScript', 'Angular', 'TypeScript', 'CSS', 'HTML', 'Node.js'];

  togglePanel() {
    this.open = !this.open;
    if (!this.open) this.showInput = false;
  }

  toggleInput() {
    this.showInput = !this.showInput;
    this.newSkill = '';
  }

  saveSkill() {
    if (this.newSkill.trim()) {
      this.skills.push(this.newSkill.trim());
      this.newSkill = '';
      this.showInput = false;
    }
  }
}
