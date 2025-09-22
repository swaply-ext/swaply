import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';

@Component({
  selector: 'app-skills',
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css']
})
export class SkillsComponent {
  categories = ['Deportes', 'Cocina', 'Otros']; // main categories
  newSkill = ''; // input to add a skill
  skillsByCategory: { [key: string]: string[] } = {}; // store skills per category

  selectedCategory = ''; // category selected in the dropdown

  addSkill() { // function to add a skill
    if (this.selectedCategory && this.newSkill.trim() !== '') {
      if (!this.skillsByCategory[this.selectedCategory]) {
        this.skillsByCategory[this.selectedCategory] = [];
      }
      this.skillsByCategory[this.selectedCategory].push(this.newSkill);
      this.newSkill = ''; // reset input field
    }
  }

  removeSkill(category: string, index: number) { // function to remove a skill
    this.skillsByCategory[category].splice(index, 1);
  }
}
