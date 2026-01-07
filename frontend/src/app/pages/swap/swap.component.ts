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
  mySkillsDisplay = signal<any[]>([]); 
  
  selectedTargetSkill = signal<{
    skillName: string;
    skillIcon?: string;
    skillImage?: string;
    location?: string;
  } | null>(null);
  
  targetUserInterests = signal<any[]>([]); 

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private searchService: SearchService
  ) {}

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
                id: target.skillName,
                name: target.skillName,
                category: target.skillCategory,
                level: target.skillLevel,
                icon: target.skillIcon
              };

              const secondarySkills = (target.userSkills || [])
                .filter(s => s.name !== mainSkill.name)
                .map(s => ({
                   id: s.name, name: s.name, category: s.category, level: s.level
                }));

              let allTargetSkills = [mainSkill, ...secondarySkills];

              let filteredTargetSkills = this.filterMatch(allTargetSkills, me.interests || []);

              if (paramSkillName && filteredTargetSkills.length > 0) {
                const searchName = paramSkillName.toLowerCase();
                const idx = filteredTargetSkills.findIndex(s => 
                  s.name.toLowerCase().includes(searchName) || searchName.includes(s.name.toLowerCase())
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
                  location: target.location
                });
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
    const safeImage = item.image 
                   || this.assignImageToSkill(item.category, item.name) 
                   || 'assets/default-avatar.png';
                   
    this.selectedTargetSkill.set({
      skillName: item.name,
      skillIcon: item.icon, 
      skillImage: safeImage,
      location: currentUser?.location
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
        image: item.image || this.assignImageToSkill(item.category, item.name)
    });
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
      skill: myItem.name,
      interest: targetItem.name
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

  private processVisuals(list: any[]): any[] {
    return list.map((item, index) => {
      const realName = item.name || item.id || 'Skill';
      return {
        ...item,
        id: item.id || realName,
        name: realName,
        image: item.image || this.assignImageToSkill(item.category, realName),
        selected: index === 0
      };
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