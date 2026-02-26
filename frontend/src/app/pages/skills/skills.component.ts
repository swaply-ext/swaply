import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SkillCardComponent } from '../../components/skill-card/skill-card.component';
import { AccountService, Account } from '../../services/account.service';
import { SkillsService, SkillsModel } from '../../services/skills.service';



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



interface UserSkill {
  id: string;
  level: number;
}

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule, FormsModule, SkillCardComponent],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css']
})

export class SkillsComponent {

  categories: Category[] = [];
  editable: boolean = true;

  // Inyectar HttpClient para hacer peticiones HTTP
  constructor(
    private skillsService: SkillsService,
    private accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.getAllSkills();
  }

  getAllSkills() {
    this.skillsService.getAllSkills()
      .subscribe({
        next: (response) => {
          this.organizeSkillsByCategory(response);
          this.getMySkills();
        },
        error: (err) => console.error('Error obteniendo skills:', err)
      });
  }

  getMySkills() {
    this.accountService.getAccount()
      .subscribe({
        next: (account) => {
          if (account.skills && account.skills.length > 0) {
            this.setLevel(account.skills);
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



  private organizeSkillsByCategory(skills: SkillsModel[]) {
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
        level: 0 //inicializar nivel a 0 para evitar undefined y problemas
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

    this.accountService.updateSkills(selectedSkills)
      .subscribe({
        next: response => {
          const source = this.route.snapshot.queryParamMap.get('source');
          console.log('Resputesta del backend:', response);
          if (source === 'profile') {
            this.router.navigate(['/myprofile']); // Si viene del perfil, vuelve al perfil
          } else {
            this.router.navigate(['/interests']);
          }
        },
        error: err => console.error('Error enviando skills:', err)
      });
  }

  handleLevelChange(event: { id: string, newLevel: number }) {
    // Buscamos la skill dentro de todas las categorías y actualizamos su nivel
    for (let category of this.categories) {
      const skill = category.skills.find(s => s.id === event.id);
      if (skill) {
        skill.level = event.newLevel;
        break; // Salimos del bucle una vez encontrada
      }
    }
  }
}


