import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppNavbarComponent } from '../../components/app-navbar/app-navbar.component';
import { AccountService } from '../../services/account.service';
import { SearchService } from '../../services/search.services';
import { UserSwapDTO } from '../../models/userSwapDTO.model';
import { SwapDTO } from '../../models/swapDTO.model';
import { ProfileDataDTO } from '../../models/profile-data-dto.model';
import { RouterLink } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { ValidateInputsService } from '../../services/validate-inputs.service';
import { SkillsPanelComponent } from "../../components/skills-panel/skills-panel.component";
import { InterestsPanelComponent } from "../../components/interests-panel/interests-panel.component";

@Component({
  selector: 'app-swap',
  standalone: true,
  imports: [CommonModule, AppNavbarComponent, SkillsPanelComponent, InterestsPanelComponent, RouterLink],
  templateUrl: './swap.component.html',
  styleUrls: ['./swap.component.css']
})
export class SwapComponent implements OnInit {

  myUser = signal<ProfileDataDTO | null>(null);
  targetUser = signal<UserSwapDTO | null>(null);

  locationTargetUser: string = 'No existe';

  selectedTeachSkill = signal<any>(null);
  selectedTargetSkill = signal<{
    id?: string;
    skillName: string;
    skillIcon?: string;
    skillImage?: string;
    location?: string;
  } | null>(null);

  mySkillsDisplay = signal<any[]>([]);
  targetUserInterests = signal<any[]>([]);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private searchService: SearchService,
    public validateInputsService: ValidateInputsService
  ) { }

  ngOnInit(): void {
    const targetUsername = this.route.snapshot.paramMap.get('username');
    const paramSkillName = this.route.snapshot.queryParamMap.get('skillName');

    if (!targetUsername) {
      this.router.navigate(['/error'], {
        state: { type: 'not-found' }
      });
      return;
    }

    this.searchService.getUserByUsername(targetUsername).pipe(
      switchMap(target => {
        return this.accountService.getProfileData().pipe(
          map(me => ({ target, me }))
        );
      })
    ).subscribe({
      next: ({ target, me }) => {
        this.targetUser.set(target);
        this.locationTargetUser = this.validateInputsService.formatLocation(target.location) ?? 'No disponible';
        this.myUser.set(me);

        const mainSkill = {
          id: target.skillName,
          name: target.skillName,
          category: target.skillCategory || '',
          level: target.skillLevel,
          icon: target.skillIcon
        };

        const secondarySkills = (target.userSkills || [])
          .filter(s => s.name !== mainSkill.name)
          .map(s => ({
            id: s.name, name: s.name, category: s.category || '', level: s.level
          }));

        let allTargetSkills = [mainSkill, ...secondarySkills];
        let filteredTargetSkills = this.filterMatch(allTargetSkills, me.interests || []);

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

        this.targetUserInterests.set(filteredTargetSkills);

        if (filteredTargetSkills.length > 0) {
          this.selectTargetInterest(filteredTargetSkills[0]);
        } else {
          this.selectedTargetSkill.set({
            skillName: target.name || target.username,
            skillIcon: undefined,
            skillImage: target.profilePhotoUrl || 'assets/default-avatar.png',
            location: target.location
          });
        }

        const targetInterests = target.interests || [];
        const myRawSkills = me.skills || [];
        const filteredMySkills = this.filterMatch(myRawSkills, targetInterests);
        
        this.mySkillsDisplay.set(filteredMySkills);

        if (filteredMySkills.length > 0) {
          this.selectMySkill(filteredMySkills[0]);
        } else {
          this.selectedTeachSkill.set({
            name: me.name || me.username,
            image: me.profilePhotoUrl || 'assets/default-avatar.png'
          });
        }
      },
      error: (err) => {
        console.error('Error recuperando datos:', err);
        this.router.navigate(['/error'], {
          state: { title: 'Error 404', msg: 'La página no existe' }
        });
      }
    });
  }


  selectTargetInterest(skill: any) {
    const currentUser = this.targetUser();
    const categorySafe = skill.category || '';
    
    const safeImage = skill.image || this.assignImageToSkill(categorySafe, skill.name || skill.id) || 'assets/default-avatar.png';

    this.selectedTargetSkill.set({
      id: skill.id, 
      skillName: skill.name || skill.id,
      skillIcon: skill.icon,
      skillImage: safeImage,
      location: currentUser?.location
    });
  }

  selectMySkill(skill: any) {
    const categorySafe = skill.category || '';
    const safeImage = skill.image || this.assignImageToSkill(categorySafe, skill.name || skill.id) || 'assets/default-avatar.png';

    this.selectedTeachSkill.set({
      id: skill.id,
      name: skill.name || skill.id,
      icon: skill.icon,
      image: safeImage
    });
  }

  getTeachSkillName() {
    const info = this.selectedTeachSkill();
    if (this.mySkillsDisplay().length === 0) {
      return info?.name || 'Yo';
    }
    return info?.name ? `Clase de ${info.name}` : '';
  }

  getTargetSkillName() {
    const info = this.selectedTargetSkill();
    if (this.targetUserInterests().length === 0) {
      return info?.skillName || 'Usuario';
    }
    return info?.skillName ? `Clase de ${info.skillName}` : '';
  }

  getTargetSkillImage() {
    return this.selectedTargetSkill()?.skillImage || 'assets/default-avatar.png';
  }

  cancelSwap() { 
    this.router.navigate(['/home']); 
  }

  createSwap() {
    const targetItem = this.selectedTargetSkill();
    const myItem = this.selectedTeachSkill();
    const targetUser = this.targetUser();

    if (!targetItem?.skillName || !myItem?.name || !targetUser) {
      return;
    }

    const payload: SwapDTO = {
      requestedUsername: targetUser.username,
      skill: targetItem.skillName,
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

  private filterMatch(offeredSkills: any[], neededInterests: any[]): any[] {
    if (!neededInterests || neededInterests.length === 0) return [];

    return offeredSkills.filter(offer => {
      const offerName = (offer.name || offer.id || '').toLowerCase();
      const offerLevel = offer.level !== undefined ? offer.level : 0;

      const match = neededInterests.find(need => {
        const needName = (need.name || need.id || '').toLowerCase();
        return offerName.includes(needName) || needName.includes(offerName);
      });

      if (!match) return false;

      const requiredLevel = match.level !== undefined ? match.level : 0;
      return offerLevel >= requiredLevel;
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