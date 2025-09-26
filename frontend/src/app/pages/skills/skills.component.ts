import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css']
})
export class SkillsComponent {
  categories = [
    {
      name: 'DEPORTES',
      id: 'sports',
      subcategories: [
        { name: 'FÚTBOL', id: 'football', selected: false },
        { name: 'PÁDEL', id: 'padel', selected: false },
        { name: 'BÁSQUET', id: 'basketball', selected: false },
        { name: 'BOXEO', id: 'boxing', selected: false },
        { name: 'VÓLEY', id: 'volleyball', selected: false }
      ]
    },
    {
      name: 'MÚSICA',
      id: 'music',
      subcategories: [
        { name: 'GUITARRA', id: 'guitar', selected: false },
        { name: 'PIANO', id: 'piano', selected: false },
        { name: 'VIOLÍN', id: 'violin', selected: false },
        { name: 'BATERÍA', id: 'drums', selected: false },
        { name: 'SAXO', id: 'saxophone', selected: false }
      ]
    },
    {
      name: 'OCIO',
      id: 'leisure',
      subcategories: [
        { name: 'COCINA', id: 'cooking', selected: false },
        { name: 'DIBUJO Y PINTURA', id: 'drawing', selected: false },
        { name: 'BAILE', id: 'dancing', selected: false },
        { name: 'MANUALIDADES', id: 'crafts', selected: false },
        { name: 'OCIO DIGITAL', id: 'digital', selected: false }
      ]
    }
  ];

  selectedCategory: string | null = null;

  constructor(private http: HttpClient) {}

  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
  }

  submitSkills(): void {
    const selectedSkills = this.categories
      .flatMap(category => category.subcategories)
      .filter(subcategory => subcategory.selected)
      .map(subcategory => subcategory.name);

      this.http.post('http://localhost:8081/api/skills/guardar', { skills: selectedSkills })
      .subscribe({
        next: response => console.log('Resposta del backend:', response),
        error: err => console.error('Error enviant skills:', err)
      });
  }
}