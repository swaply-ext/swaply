import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';

@Component({
  selector: 'app-interests',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './interests.component.html',
  styleUrl: './interests.component.css'
})
export class InterestsComponent {
  categories = ['Deportes', 'Cocina', 'Otros']; // main categories
  newInterest = ''; // input to add a preference
  interestsByCategory: { [key: string]: string[] } = {}; // store interests per category

  selectedCategory = ''; // category selected in dropdown

  addInterest() { // add a new interest
    if (this.selectedCategory && this.newInterest.trim() !== '') {
      if (!this.interestsByCategory[this.selectedCategory]) {
        this.interestsByCategory[this.selectedCategory] = [];
      }
      this.interestsByCategory[this.selectedCategory].push(this.newInterest);
      this.newInterest = '';
    }
  }

  removeInterest(category: string, index: number) { // remove an interest
    this.interestsByCategory[category].splice(index, 1);
  }
}

