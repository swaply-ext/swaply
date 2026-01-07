import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppNavbarComponent } from '../../components/app-navbar/app-navbar.component';
import { AccountService } from '../../services/account.service';
import { SearchService, UserSwapDTO, SwapDTO } from '../../services/search.services';
import { SwapSkillsComponent } from "../../components/swap-skills/swap-skills.component";
import { SwapInterestsComponent } from "../../components/swap-interests/swap-interests.component";
import { ProfileDataDTO } from '../../models/profile-data-dto.model';
import { RouterLink } from '@angular/router';




@Component({
  selector: 'app-swap',
  standalone: true,
  imports: [CommonModule, AppNavbarComponent, SwapSkillsComponent, SwapInterestsComponent, RouterLink],
  templateUrl: './swap.component.html',
  styleUrls: ['./swap.component.css']
})
export class SwapComponent implements OnInit {

  myUser = signal<ProfileDataDTO | null>(null);
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
  ) { }

  ngOnInit(): void {
    const targetUsername = this.route.snapshot.paramMap.get('username');
    const paramSkillName = this.route.snapshot.queryParamMap.get('skillName');

    // CARGAR MI USUARIO
    this.accountService.getProfileData().subscribe({
      next: (me) => {
        this.myUser.set(me);

        if (me.skills && me.skills.length > 0) {
          const myVisualSkills = me.skills.map((s: any, index: number) => {
            const realName = s.name || s.id || 'Skill sin nombre';
            return {
              ...s,
              id: s.id || realName,
              name: realName,
              image: s.image || this.assignImageToSkill(s.category, realName),
              selected: index === 0
            };
          });

          this.mySkillsDisplay.set(myVisualSkills);
          this.selectedTeachSkill.set(myVisualSkills[0]);
        }
      }
    });

    // CARGAR USUARIO DESTINO
    if (targetUsername) {
      this.searchService.getUserByUsername(targetUsername).subscribe({
        next: (user) => {
          this.targetUser.set(user);

          // Construir lista con skill principal + secundarias
          const mainSkill = {
            id: user.skillName,
            name: user.skillName,
            category: user.skillCategory,
            level: user.skillLevel,
            icon: user.skillIcon,
            image: this.assignImageToSkill(user.skillCategory, user.skillName),
            selected: false
          };

          const secondarySkills = (user.userSkills || [])
            .filter(s => s.name !== mainSkill.name) // Evitar duplicados
            .map(s => ({
              id: s.name,
              name: s.name,
              category: s.category,
              level: s.level,
              image: this.assignImageToSkill(s.category, s.name),
              selected: false
            }));

          let allInterests = [mainSkill, ...secondarySkills];

          // Si hay parametro URL, buscamos esa skill y la ponemos PRIMERA
          if (paramSkillName) {
            const targetNameInfo = paramSkillName.toLowerCase();
            const foundIndex = allInterests.findIndex(s =>
              s.name.toLowerCase().includes(targetNameInfo) || targetNameInfo.includes(s.name.toLowerCase())
            );

            // Si la encontramos y no está ya la primera, la movemos al principio
            if (foundIndex > 0) {
              const [itemToMove] = allInterests.splice(foundIndex, 1);
              allInterests.unshift(itemToMove);
            }
          }

          // Marcamos la primera (índice 0) como seleccionada
          allInterests = allInterests.map((item, index) => ({
            ...item,
            selected: index === 0
          }));

          this.targetUserInterests.set(allInterests);

          // Actualizamos la carta grande superior con la primera (la seleccionada)
          const selectedItem = allInterests[0];
          this.selectedTargetSkill.set({
            skillName: selectedItem.name,
            skillIcon: (selectedItem as any).icon,
            skillImage: selectedItem.image,
            location: user.location.displayName
          });
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

    const currentUser = this.targetUser();
    this.selectedTargetSkill.set({
      skillName: item.name,
      skillIcon: item.icon,
      skillImage: item.image || this.assignImageToSkill(item.category, item.name),
      location: currentUser?.location.displayName
    });
  }

  selectMySkill(item: any) {
    const itemId = item.id || item.name;

    const updatedList = this.mySkillsDisplay().map(skill => {
      const currentId = skill.id || skill.name;
      return {
        ...skill,
        selected: currentId === itemId
      };
    });
    this.mySkillsDisplay.set(updatedList);

    this.selectedTeachSkill.set({
      ...item,
      name: item.name,
      image: item.image || this.assignImageToSkill(item.category, item.name)
    });
  }

  getTargetSkillName() {
    const info = this.selectedTargetSkill();
    return info?.skillName ? `Clase de ${info.skillName}` : '';
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
      skill: myItem.name,
      interest: targetItem.name
    };

    this.searchService.sendSwapRequest(payload).subscribe({
      next: (res) => {
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error(err);
        console.log("Error al crear el intercambio");
      }
    });
  }

  private assignImageToSkill(category: string, skillName: string): string | undefined {
    if (!skillName) return undefined;
    const name = skillName.toLowerCase();
    const map: any = {
      'futbol': ['sports', 'football.jpg'],
      'fútbol': ['sports', 'football.jpg'],
      'padel': ['sports', 'padel.jpg'],
      'pádel': ['sports', 'padel.jpg'],
      'basket': ['sports', 'basketball.jpg'],
      'basquet': ['sports', 'basketball.jpg'],
      'baloncesto': ['sports', 'basketball.jpg'],
      'voley': ['sports', 'voleyball.jpg'],
      'vóley': ['sports', 'voleyball.jpg'],
      'boxeo': ['sports', 'boxing.jpg'],
      'guitarra': ['music', 'guitar.jpg'],
      'piano': ['music', 'piano.jpg'],
      'violin': ['music', 'violin.jpg'],
      'violín': ['music', 'violin.jpg'],
      'bateria': ['music', 'drums.jpg'],
      'batería': ['music', 'drums.jpg'],
      'saxofon': ['music', 'saxophone.jpg'],
      'saxofón': ['music', 'saxophone.jpg'],
      'dibujo': ['leisure', 'draw.jpg'],
      'cocina': ['leisure', 'cook.jpg'],
      'manualidades': ['leisure', 'crafts.jpg'],
      'digital': ['leisure', 'digital_entertainment.jpg'],
      'baile': ['leisure', 'dance.jpg'],
      'dance': ['leisure', 'dance.jpg']
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
