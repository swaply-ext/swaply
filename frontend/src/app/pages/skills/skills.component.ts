import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

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
      name: 'Deportes',
      id: 'sports',
      open: true,
      subcategories: [
        { name: 'FÚTBOL', icon: '⚽', id: 'football', selected: false },
        { name: 'PÁDEL', icon: '🎾', id: 'padel', selected: false },
        { name: 'BÁSQUET', icon: '🏀', id: 'basketball', selected: false },
        { name: 'VÓLEY', icon: '🏐', id: 'volleyball', selected: false },
        { name: 'BOXEO', icon: '🥊', id: 'boxing', selected: false }
      ]
    },
    {
      name: 'Música',
      id: 'music',
      open: true,
      subcategories: [
        { name: 'GUITARRA', icon: '🎸', id: 'guitar', selected: false },
        { name: 'PIANO', icon: '🎹', id: 'piano', selected: false },
        { name: 'VIOLÍN', icon: '🎻', id: 'violin', selected: false },
        { name: 'BATERÍA', icon: '🥁', id: 'drums', selected: false },
        { name: 'SAXOFÓN', icon: '🎷', id: 'saxophone', selected: false }
      ]
    },
    {
      name: 'Ocio',
      id: 'leisure',
      open: true,
      subcategories: [
        { name: 'DIBUJO', icon: '🎨', id: 'drawing', selected: false },
        { name: 'COCINA', icon: '👨‍🍳', id: 'cooking', selected: false },
        { name: 'BAILE', icon: '💃', id: 'dancing', selected: false },
        { name: 'MANUALIDADES', icon: '🛠️', id: 'crafts', selected: false },
        { name: 'OCIO DIGITAL', icon: '🖥️', id: 'digital', selected: false }
      ]
    }
  ];

  // Inyectar HttpClient para hacer peticiones HTTP
  constructor(private http: HttpClient) { }

  toggleCategory(categoryId: string) {
    const category = this.categories.find(c => c.id === categoryId);
    if (category) category.open = !category.open;
  }

  toggleSkill(categoryId: string, subId: string) {
    const category = this.categories.find(c => c.id === categoryId);
    const sub = category?.subcategories.find(s => s.id === subId);
    if (sub) sub.selected = !sub.selected;
  }

  // Función para enviar las skills seleccionadas al backend
  submitSkills() {
    const selectedSkills = this.categories.flatMap(category => 
      category.subcategories
        .filter(sub => sub.selected)
        .map(sub => ({
          id: sub.id,                                  
          level: 1                       
        }))
    );

    this.http.patch('http://localhost:8081/api/account/skills', { skills: selectedSkills })
      .subscribe({
        next: response => console.log('Resputesta del backend:', response),
        error: err => console.error('Error enviando skills:', err)
      });
  }
}


