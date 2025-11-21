// Importaciones necesarias desde Angular
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

// Decorador que define el componente
@Component({
  selector: 'app-interests',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './interests.component.html',
  styleUrls: ['./interests.component.css']
})
export class InterestsComponent {

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

  // Inyectar HttpClient para hacer peticiones HTTP
  constructor(private http: HttpClient) { }

  toggleCategory(categoryId: string) {
    const category = this.categories.find(c => c.id === categoryId);
    if (category) category.open = !category.open;
  }

  toggleInterest(categoryId: string, subId: string) {
    const category = this.categories.find(c => c.id === categoryId);
    const sub = category?.subcategories.find(s => s.id === subId);
    if (sub) sub.selected = !sub.selected;
  }

  // Función para enviar las skills seleccionadas al backend
  submitInterests() {
    const selectedInterests = this.categories
      .flatMap(category => category.subcategories)
      .filter(subcategory => subcategory.selected)
      .map(subcategory => {
        return { name: subcategory.id, level: 1 };
      });



    this.http.patch('http://localhost:8081/api/account/interests', { interests: selectedInterests })
      .subscribe({
        next: response => console.log('Resputesta del backend:', response),
        error: err => console.error('Error enviando skills:', err)
      });
  }
}