import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule],
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
        { name: 'FÚTBOL ⚽', id: 'football', selected: false },
        { name: 'PÁDEL 🎾', id: 'padel', selected: false },
        { name: 'BÁSQUET 🏀', id: 'basketball', selected: false },
        { name: 'VÓLEY 🏐', id: 'volleyball', selected: false },
        { name: 'BOXEO 🥊', id: 'boxing', selected: false }
      ]
    },
    {
      name: 'Música',
      id: 'music',
      open: true,
      subcategories: [
        { name: 'GUITARRA 🎸', id: 'guitar', selected: false },
        { name: 'PIANO 🎹', id: 'piano', selected: false },
        { name: 'VIOLÍN 🎻', id: 'violin', selected: false },
        { name: 'BATERÍA 🥁', id: 'drums', selected: false },
        { name: 'SAXOFÓN 🎷', id: 'saxophone', selected: false }
      ]
    },
    {
      name: 'Ocio',
      id: 'leisure',
      open: true,
      subcategories: [
        { name: 'DIBUJO 🎨', id: 'drawing', selected: false },
        { name: 'COCINA 👨‍🍳', id: 'cooking', selected: false },
        { name: 'BAILE 💃', id: 'dancing', selected: false },
        { name: 'MANUALIDADES 🛠️', id: 'crafts', selected: false },
        { name: 'OCIO DIGITAL 🖥️', id: 'digital', selected: false }
      ]
    }
  ];

  constructor(private http: HttpClient) {}

  toggleCategory(categoryId: string) {
    const category = this.categories.find(c => c.id === categoryId);
    if (category) category.open = !category.open;
  }

  toggleSkill(categoryId: string, subId: string) {
    const category = this.categories.find(c => c.id === categoryId);
    const sub = category?.subcategories.find(s => s.id === subId);
    if (sub) sub.selected = !sub.selected;
  }

  submitSkills() {
    const selectedSkills = this.categories
      .flatMap(cat => cat.subcategories)
      .filter(s => s.selected)
      .map(s => ({ name: s.name, level: null }));

    this.http.patch('http://localhost:8081/api/users/USR-001', {
      skills: selectedSkills
    }).subscribe({
      next: res => console.log('Respuesta backend:', res),
      error: err => console.error('Error enviando skills:', err)
    });
  }
}
