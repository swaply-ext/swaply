import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { timeInterval } from 'rxjs';
import { RouterLink } from '@angular/router';

interface SkillDTO {
  id: string;
  name: string;
  category: string;
  icon: string;
}

interface SkillItem {
  id: string;
  name: string;
  icon: string;
  selected: boolean;
}

interface Category {
  name: string;
  isOpen: boolean;
  skills: SkillItem[];
}

interface Account {
  skills: { id: string, level: number }[]
}

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css']
})

export class SkillsComponent {

  categories: Category[] = [];

  // Inyectar HttpClient para hacer peticiones HTTP
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getAllSkills('http://localhost:8081/api/skills');

  }

  getAllSkills(URI: string) {
    this.http.get<SkillDTO[]>(URI)
      .subscribe({
        next: (response) => {
          this.organizeSkillsByCategory(response);
          this.getMySkills('http://localhost:8081/api/account');
        },
        error: (err) => console.error('Error obteniendo skills:', err)
      });
  }



  getMySkills(URI: string) {
    this.http.get<Account>(URI)
      .subscribe({
        next: (account) => {
          if (account.skills && account.skills.length > 0) {
            this.markSkills(account.skills);
          }
        },
        error: (err) => console.error('Error obteniendo account:', err)
      });
  }

  private markSkills(mySkills: { id: string; level: number }[]) {
    this.categories.forEach(category => {
      category.skills.forEach(skill => {
        const match = mySkills.find(us => us.id === skill.id);
        if (match) {
          skill.selected = true;
        }
      })
    });
  }



  private organizeSkillsByCategory(skills: SkillDTO[]) {
    const grouped: Category[] = [];

    skills.forEach(skill => {
      let category = grouped.find(c => c.name === skill.category.toUpperCase());

      if (!category) {
        category = {
          name: skill.category.toUpperCase(),

          isOpen: true, // Por defecto abierta
          skills: []
        };
        grouped.push(category);
      }

      category.skills.push({
        name: skill.name,
        icon: skill.icon,
        id: skill.id,
        selected: false
      });
    });
    this.categories = grouped;
  }

  toggleCategory(categoryId: string) {
    const category = this.categories.find(c => c.name === categoryId);
    if (category) category.isOpen = !category.isOpen;
  }

  toggleSkill(categoryName: string, skillId: string) {
    const category = this.categories.find(c => c.name === categoryName);
    const sub = category?.skills.find(s => s.id === skillId);
    if (sub) sub.selected = !sub.selected;
  }

  // Función para enviar las skills seleccionadas al backend
  submitSkills() {
    const selectedSkills = this.categories.flatMap(category =>
      category.skills
        .filter(skill => skill.selected)
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


