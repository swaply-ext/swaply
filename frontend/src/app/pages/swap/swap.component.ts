import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppNavbarComponent } from '../../components/app-navbar/app-navbar.component';
import { AccountService } from '../../services/account.service';
import { SearchService, UserSwapDTO, SwapDTO } from '../../services/search.services';
import { SwapSkillsComponent } from "../../components/swap-skills/swap-skills.component";
import { SwapInterestsComponent } from "../../components/swap-interests/swap-interests.component";

interface UserProfile {
  username: string;
  name: string;
  location?: string;
  skills?: any[];
  interests?: any[];
  profilePhotoUrl?: string;
}

@Component({
  selector: 'app-swap',
  standalone: true,
  imports: [CommonModule, AppNavbarComponent, SwapSkillsComponent, SwapInterestsComponent],
  templateUrl: './swap.component.html',
  styleUrls: ['./swap.component.css']
})
export class SwapComponent implements OnInit {

  myUser = signal<UserProfile | null>(null);
  targetUser = signal<UserSwapDTO | null>(null);

  selectedTeachSkill = signal<any>(null); 
  
  selectedTargetSkill = signal<{
    skillName: string;
    skillIcon?: string;
    skillImage?: string;
    location?: string;
  } | null>(null);

  targetUserInterests = signal<any[]>([]); 
  mySkillsDisplay = signal<any[]>([]); 

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    const targetUserId = this.route.snapshot.paramMap.get('targetId');
    const skillName = this.route.snapshot.queryParamMap.get('skillName');

    // CARGAR MI USUARIO
    this.accountService.getProfileData().subscribe({
      next: (me) => {
        this.myUser.set(me);
        
        if (me.skills && me.skills.length > 0) {
          // Preparamos skills
          const myVisualSkills = me.skills.map((s: any, index: number) => {
            // CORRECCION: Si no hay nombre, usa el ID. Si no hay ID, usa 'Skill'.
            const realName = s.name || s.id || 'Skill sin nombre';
            const realId = s.id || realName;
            
            return {
              ...s,
              id: realId,
              name: realName, 
              image: s.image || this.assignImageToSkill(s.category, realName),
              selected: index === 0 
            };
          });

          this.mySkillsDisplay.set(myVisualSkills);
          // La carta de arriba muestra el objeto completo de la primera skill
          this.selectedTeachSkill.set(myVisualSkills[0]);
        }
      }
    });

    // CARGAR USUARIO DESTINO
    if (targetUserId) {
      this.searchService.getUserById(targetUserId).subscribe({
        next: (user) => {
          this.targetUser.set(user);
          const selectedSkill = skillName || user.skillName;

          this.selectedTargetSkill.set({
            skillName: selectedSkill,
            skillIcon: user.skillIcon,
            skillImage: this.assignImageToSkill(user.skillCategory, selectedSkill),
            location: user.location
          });

          const mainSkillObj = {
            id: selectedSkill,
            name: selectedSkill,
            selected: true,
            image: this.assignImageToSkill(user.skillCategory, selectedSkill),
            level: user.skillLevel
          };

          const otherSkills = (user.userSkills || [])
            .filter(s => s.name !== selectedSkill)
            .map(s => ({
              id: s.name,
              name: s.name,
              selected: false,
              image: this.assignImageToSkill(s.category, s.name),
              level: s.level
            }));

          this.targetUserInterests.set([mainSkillObj, ...otherSkills]);
        }
      });
    }
  }

  selectTargetInterest(item: any) {
    const updatedList = this.targetUserInterests().map(skill => ({
      ...skill,
      selected: skill.name === item.name 
    }));
    this.targetUserInterests.set(updatedList);

    const newImage = item.image || this.assignImageToSkill(item.category, item.name);
    const currentUser = this.targetUser();

    this.selectedTargetSkill.set({
      skillName: item.name,
      skillIcon: item.icon, 
      skillImage: newImage,
      location: currentUser?.location
    });
  }

  selectMySkill(item: any) {
    const itemId = item.id || item.name;

    // Actualizamos la lista
    const updatedList = this.mySkillsDisplay().map(skill => {
      const currentId = skill.id || skill.name;
      return {
        ...skill,
        selected: currentId === itemId
      };
    });
    this.mySkillsDisplay.set(updatedList);

    // Calculamos imagen
    const newImage = item.image || this.assignImageToSkill(item.category, item.name);
    
    // Actualizamos la carta de arriba con los datos de la skill
    this.selectedTeachSkill.set({
        ...item,
        name: item.name, 
        image: newImage 
    });
  }

  getTargetSkillName() {
    return this.selectedTargetSkill()?.skillName || '';
  }

  getTargetSkillImage() {
    return this.selectedTargetSkill()?.skillImage
        || this.selectedTargetSkill()?.skillIcon
        || 'assets/default-avatar.png';
  }

  cancelSwap() { this.router.navigate(['/home']); }

  createSwap() {
    const targetItem = this.targetUserInterests().find(s => s.selected);
    const myItem = this.mySkillsDisplay().find(s => s.selected);
    const targetUser = this.targetUser();

    if (!targetItem || !myItem || !targetUser) {
      alert("Error: Selecciona una habilidad en cada lado.");
      return;
    }

    const payload: SwapDTO = {
      requestedUsername: targetUser.username,
      skill: targetItem.name,
      interest: myItem.name
    };

    this.searchService.sendSwapRequest(payload).subscribe({
      next: (res) => {
        alert("Intercambio creado correctamente");
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error(err);
        alert("Error al crear el intercambio");
      }
    });
  }

  private assignImageToSkill(category: string, skillName: string): string | undefined {
    if (!skillName) return undefined;
    const name = skillName.toLowerCase();
    const map: any = {
      'futbol': ['sports','football.jpg'],
      'fútbol': ['sports','football.jpg'],
      'padel': ['sports','padel.jpg'],
      'pádel': ['sports','padel.jpg'],
      'basket': ['sports','basketball.jpg'],
      'basquet': ['sports','basketball.jpg'],
      'baloncesto': ['sports','basketball.jpg'],
      'voley': ['sports','voleyball.jpg'],
      'vóley': ['sports','voleyball.jpg'],
      'boxeo': ['sports','boxing.jpg'],
      'guitarra': ['music','guitar.jpg'],
      'piano': ['music','piano.jpg'],
      'violin': ['music','violin.jpg'],
      'violín': ['music','violin.jpg'],
      'bateria': ['music','drums.jpg'],
      'batería': ['music','drums.jpg'],
      'saxofon': ['music','saxophone.jpg'],
      'saxofón': ['music','saxophone.jpg'],
      'dibujo': ['leisure','draw.jpg'],
      'cocina': ['leisure','cook.jpg'],
      'manualidades': ['leisure','crafts.jpg'],
      'digital': ['leisure','digital_entertainment.jpg'],
      'baile': ['leisure','dance.jpg'],
      'dance': ['leisure','dance.jpg']
    };

    for (const key of Object.keys(map)) {
      if (name.includes(key)) {
        const [folder, file] = map[key];
        return `assets/photos_skills/${folder}/${file}`;
      }
    }
    
    if (category) {
        if (category.toLowerCase().includes('sport')) return 'assets/photos_skills/sports/football.jpg';
        if (category.toLowerCase().includes('music')) return 'assets/photos_skills/music/guitar.jpg';
        if (category.toLowerCase().includes('leisure')) return 'assets/photos_skills/leisure/crafts.jpg';
    }

    return undefined;
  }
}