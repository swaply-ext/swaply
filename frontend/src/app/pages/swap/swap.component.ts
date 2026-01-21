import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppNavbarComponent } from '../../components/app-navbar/app-navbar.component';
import { AccountService } from '../../services/account.service';
import { SearchService } from '../../services/search.services';
import { UserSwapDTO } from '../../models/userSwapDTO.model';
import { SwapDTO } from '../../models/swapDTO.model';
import { SwapSkillsComponent } from "../../components/swap-skills/swap-skills.component";
import { SwapInterestsComponent } from "../../components/swap-interests/swap-interests.component";
import { ProfileDataDTO } from '../../models/profile-data-dto.model';
import { RouterLink } from '@angular/router';
import { SkillDisplay, SkillsModel } from '../../models/skills.models';

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

  selectedTeachSkill = signal<SkillDisplay | any>(null);
  mySkillsDisplay = signal<(SkillDisplay & { selected?: boolean; image?: string })[]>([]);

  selectedTargetSkill = signal<SkillDisplay | any>(null);

  targetUserInterests = signal<(SkillDisplay & { selected?: boolean; image?: string })[]>([]);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private searchService: SearchService
  ) { }

  ngOnInit(): void {
    const targetUsername = this.route.snapshot.paramMap.get('username');
    const paramSkillName = this.route.snapshot.queryParamMap.get('skillName');

    if (targetUsername) {
      this.searchService.getUserByUsername(targetUsername).subscribe({
        next: (target) => {
          this.targetUser.set(target);

          this.accountService.getProfileData().subscribe({
            next: (me) => {
              this.myUser.set(me);

              const mainSkill = {
                id: target.skill.id,
                name: target.skill.name,
                category: target.skill.category,
                level: target.skill.level,
                icon: target.skill.icon
              };

              const secondarySkills = (target.userSkills || [])
                .filter(s => s.id !== mainSkill.id)
                .map(s => ({
                  id: s.id,
                  level: s.level,
                }));

              let allTargetSkills = [mainSkill, ...secondarySkills];

              let filteredTargetSkills = this.filterMatch(allTargetSkills as any[], (me.interests || []) as any[]);

              if (paramSkillName && filteredTargetSkills.length > 0) {
                const searchName = paramSkillName.toLowerCase();
                const idx = filteredTargetSkills.findIndex(s =>
                  (s.name || '').toLowerCase().includes(searchName) || searchName.includes((s.name || '').toLowerCase())
                );
                if (idx > 0) {
                  const [item] = filteredTargetSkills.splice(idx, 1);
                  filteredTargetSkills.unshift(item);
                }
              }

              const visualTargetSkills = this.processVisuals(filteredTargetSkills);
              this.targetUserInterests.set(visualTargetSkills);

              if (visualTargetSkills.length > 0) {
                const item = visualTargetSkills[0];
                this.selectedTargetSkill.set({
                  skillName: item.name,
                  skillIcon: (item as any).icon,
                  skillImage: item.image,
                  location: target.location.displayName
                });
              } else {
                this.selectedTargetSkill.set({
                  skillName: target.name || target.username,
                  skillIcon: undefined,
                  skillImage: target.profilePhotoUrl || 'assets/default-avatar.png'
                });
              }

              const targetInterests = target.interests || [];
              const myRawSkills = me.skills || [];

              const filteredMySkills = this.filterMatch(myRawSkills as any[], (targetInterests || []) as any[]);


              const visualMySkills = this.processVisuals(filteredMySkills);
              this.mySkillsDisplay.set(visualMySkills);

              if (visualMySkills.length > 0) {
                this.selectedTeachSkill.set(visualMySkills[0]);
              } else {
                this.selectedTeachSkill.set({
                  name: me.name || me.username,
                  image: me.profilePhotoUrl || 'assets/default-avatar.png'
                });
              }
            }
          });
        }
      });
    }
  }

  selectTargetInterest(event: any) {
    const item = event.skill ? event.skill : event;

    const updatedList = this.targetUserInterests().map(skill => ({
      ...skill,
      selected: skill.name === item.name
    }));
    this.targetUserInterests.set(updatedList);

    const currentUser = this.targetUser();

    const categorySafe = item.category || '';

    const safeImage = item.image
      || this.assignImageToSkill(categorySafe, item.name)
      || 'assets/default-avatar.png';

    this.selectedTargetSkill.set({
      skillName: item.name,
      skillIcon: item.icon,
      skillImage: safeImage,
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

    const categorySafe = item.category || '';

    this.selectedTeachSkill.set({
      ...item,
      image: item.image || this.assignImageToSkill(categorySafe, item.name)
    });
  }

  getTeachSkillName() {
    const info = this.selectedTeachSkill() as SkillDisplay;
    if (this.mySkillsDisplay().length === 0) {
      return info?.name || 'Yo';
    }
    return info?.name ? `Clase de ${info.name}` : '';
  }

  getTargetSkillName() {
    const info = this.selectedTargetSkill() as SkillDisplay;

    if (this.targetUserInterests().length === 0) {
      return info?.name || 'Usuario';
    }

    return info?.name ? `Clase de ${info.name}` : '';
  }

  getTargetSkillImage() {
    return this.selectedTargetSkill()?.skillImage || 'assets/default-avatar.png';
  }

  cancelSwap() { this.router.navigate(['/home']); }

  createSwap() {
    const targetItem = this.targetUserInterests().find(s => s.selected);
    const myItem = this.mySkillsDisplay().find(s => s.selected);
    const targetUser = this.targetUser();

    if (!targetItem || !myItem || !targetUser) {
      alert("No se puede crear el intercambio. No existen coincidencias compatibles.");
      return;
    }

    const payload: SwapDTO = {
      requestedUsername: targetUser.username,
      skill: targetItem.name,
      interest: myItem.name
    };

    this.searchService.sendSwapRequest(payload).subscribe({
      next: (res) => {
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  private filterMatch(offeredSkills: SkillDisplay[], neededInterests: SkillsModel[]): SkillDisplay[] {
    if (!neededInterests || neededInterests.length === 0) return [];

    return offeredSkills.filter(offer => {
      const offerName = (offer.name || offer.id || '').toLowerCase();
      const offerLevel = offer.level !== undefined ? offer.level : 0;

      const match = neededInterests.find(need => {
        const needName = (need.name || need.id || '').toLowerCase();
        return offerName.includes(needName) || needName.includes(offerName);
      });

      if (!match) return false;

      const requiredLevel = (match as any).level !== undefined ? (match as any).level : 0;
      return offerLevel >= requiredLevel;
    });
  }

  private processVisuals(list: SkillDisplay[]): (SkillDisplay & { selected?: boolean; image?: string })[] {
    return list.map((item, index) => {
      const realName = item.name || item.id || 'Skill';
      const categorySafe = item.category || '';
      return {
        ...item,
        id: item.id || realName,
        name: realName,
        image: (item as any).image || this.assignImageToSkill(categorySafe, realName),
        selected: index === 0
      };
    });
  }

  private assignImageToSkill(category: string, skillName: string): string | undefined {
    if (!skillName) return undefined;

    const name = String(skillName).toLowerCase();

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
      const catLower = String(category).toLowerCase();
      if (catLower.includes('sport')) return 'assets/photos_skills/sports/football.jpg';
      if (catLower.includes('music')) return 'assets/photos_skills/music/guitar.jpg';
      if (catLower.includes('leisure')) return 'assets/photos_skills/leisure/crafts.jpg';
    }

    return undefined;
  }
}
