import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css']
})
export class SkillsComponent {
  // Definim les categories i subcategories
  categories = [
    {
      name: 'DEPORTES',
      id: 'sports',
      subcategories: [
        { name: 'FÚTBOL', id: 'football', selected: false },
        { name: 'PÁDEL', id: 'padel', selected: false },
        { name: 'BÁSQUET', id: 'basketball', selected: false },
        { name: 'BOXEO', id: 'boxing', selected: false },
        { name: 'VÓLEY', id: 'volleyball', selected: false }
      ]
    },
    {
      name: 'MÚSICA',
      id: 'music',
      subcategories: [
        { name: 'GUITARRA', id: 'guitar', selected: false },
        { name: 'PIANO', id: 'piano', selected: false },
        { name: 'VIOLÍN', id: 'violin', selected: false },
        { name: 'BATERÍA', id: 'drums', selected: false },
        { name: 'SAXO', id: 'saxophone', selected: false }
      ]
    },
    {
      name: 'OCIO',
      id: 'leisure',
      subcategories: [
        { name: 'COCINA', id: 'cooking', selected: false },
        { name: 'DIBUJO Y PINTURA', id: 'drawing', selected: false },
        { name: 'BAILE', id: 'dancing', selected: false },
        { name: 'MANUALIDADES', id: 'crafts', selected: false },
        { name: 'OCIO DIGITAL', id: 'digital', selected: false }
      ]
    }
  ];

  selectedCategory: string | null = null;
  
  // Funció per seleccionar una categoria
  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
  }
  
  // Funció per enviar el formulari
  submitSkills(): void {
    // Recollim les subcategories seleccionades
    const selectedSkills = this.categories
      .flatMap(category => category.subcategories)
      .filter(subcategory => subcategory.selected)
      .map(subcategory => subcategory.name);
    
    console.log('Habilitats seleccionades:', selectedSkills);
    // Aquí pots afegir la lògica per enviar les dades al servidor
  }
}