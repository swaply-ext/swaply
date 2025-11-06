// Importaciones necesarias desde Angular
import { NgFor, NgIf } from '@angular/common';         
import { Component } from '@angular/core';             
import { FormsModule, NgModel } from '@angular/forms'; 
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
  
  // ===  Definición de las categorías principales y sus subcategorías ===
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

  // ===  Guarda la categoría seleccionada por el usuario ===
  selectedCategory: string | null = null;

  // === Inyección del servicio HttpClient para hacer peticiones HTTP ===
  constructor(private http: HttpClient) {}

  // === Función que se ejecuta cuando el usuario selecciona una categoría ===
  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
    // Esto actualiza qué subcategorías se muestran en pantalla
  }

  // === Devuelve las subcategorías de la categoría actualmente seleccionada ===
  getSelectedSubcategories() {
    const selected = this.categories.find(cat => cat.id === this.selectedCategory);
    return selected ? selected.subcategories : [];
  }

    toggleCategory(categoryId: string) {
    const category = this.categories.find(c => c.id === categoryId);
    if (category) category.open = !category.open;
  }

  toggleInterest(categoryId: string, subId: string) {
    const category = this.categories.find(c => c.id === categoryId);
    const sub = category?.subcategories.find(s => s.id === subId);
    if (sub) sub.selected = !sub.selected;
  }

  // === Envía las subcategorías marcadas al backend ===
  submitInterests(): void {
    // Filtra todas las subcategorías de todas las categorías
    // y se queda solo con las que tienen selected = true
    const selectedInterests = this.categories
      .flatMap(category => category.subcategories)  
      .filter(subcategory => subcategory.selected)  
      .map(subcategory => {
        return { name: subcategory.name, level: 1 };
      });

    // Envía los intereses seleccionados al servidor
    this.http.post('http://localhost:8081/api/account/interests', { interests: selectedInterests })
      .subscribe({
        next: response => console.log('Respuesta del backend:', response), 
        error: err => console.error('Error enviando intereses:', err)      
      });
  }
}