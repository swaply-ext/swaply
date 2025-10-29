import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  // Inyectar HttpClient para hacer peticiones HTTP
  constructor(private http: HttpClient) {}

  // Función para seleccionar una categoría
  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
  }

  // Función para enviar las skills seleccionadas al backend
  submitSkills(): void {
    const selectedSkills = this.categories
      .flatMap(category => category.subcategories)
      .filter(subcategory => subcategory.selected)
      .map(subcategory => subcategory.name);

      this.http.post('http://localhost:8081/api/skills/save', { skills: selectedSkills })
      .subscribe({
        next: response => console.log('Resputesta del backend:', response),
        error: err => console.error('Error enviando skills:', err)
      });
  }
}