// Importaciones necesarias desde Angular
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { SkillCardComponent } from '../../components/skill-card/skill-card.component';

interface SkillDTO {
  id: string;
  name: string;
  category: string;
  icon: string;
  level: number;
}

interface SkillItem {
  id: string;
  name: string;
  icon: string;
  level: number;
}

interface Category {
  name: string;
  isOpen: boolean;
  skills: SkillItem[];
}

interface Account {
  interests: UserSkill[]
}

interface UserSkill {
  id: string;
  level: number;
}



// Decorador que define el componente
@Component({
  selector: 'app-interests',
  standalone: true,
  imports: [FormsModule, CommonModule, SkillCardComponent],
  templateUrl: './interests.component.html',
  styleUrls: ['./interests.component.css']
})
export class InterestsComponent {


  categories: Category[] = [];
  editable: boolean = true;

  // Inyectar HttpClient para hacer peticiones HTTP
  constructor(private http: HttpClient, private router: Router) { }


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
          if (account.interests && account.interests.length > 0) {
            this.setLevel(account.interests);
          }
        },
        error: (err) => console.error('Error obteniendo account:', err)
      });

  }

  private setLevel(mySkills: UserSkill[]) {
    this.categories = this.categories.map(category => ({
      ...category,
      skills: category.skills.map(skill => {
        const match = mySkills.find(us => us.id === skill.id);
        return {
          ...skill,
          level: match ? match.level : 0 // Si no está en mi cuenta, nivel 0
        };
      })
    }));

    this.categories.forEach(category => {
      category.skills.forEach(skill => {
        const match = mySkills.find(us => us.id === skill.id);
        if (match) {
          skill.level = match.level;
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

          isOpen: false, // Por defecto cerrada
          skills: []
        };
        grouped.push(category);
      }

      category.skills.push({
        name: skill.name,
        icon: skill.icon,
        id: skill.id,
        level: skill.level
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
  }

  // Función para enviar las skills seleccionadas al backend
  submitSkills() {
    const selectedSkills = this.categories.flatMap(category =>
      category.skills
        .filter(skill => skill.level > 0)
        .map(sub => ({
          id: sub.id,
          level: sub.level
        }))
    );

    this.http.patch('http://localhost:8081/api/account/interests', { interests: selectedSkills })
      .subscribe({
        next: response => {
          console.log('Resputesta del backend:', response);
          this.router.navigate(['/myprofile']);
        },
        error: err => console.error('Error enviando interests:', err)
      });
  }

  handleLevelChange(event: { id: string, newLevel: number }) {
    // Buscamos el interest dentro de todas las categorías y actualizamos su nivel
    for (let category of this.categories) {
      const skill = category.skills.find(s => s.id === event.id);
      if (skill) {
        skill.level = event.newLevel;
        break; // Salimos del bucle una vez encontrada
      }
    }
  }
}