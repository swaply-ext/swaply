import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppNavbarComponent } from '../../components/app-navbar/app-navbar.component';
import { AccountService } from '../../services/account.service';
import { SearchService, UserSwapDTO } from '../../services/search.services';
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

  constructor(
    private route: ActivatedRoute,
    private accountService: AccountService,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {

    const targetUserId = this.route.snapshot.paramMap.get('targetId');
    const skillName = this.route.snapshot.queryParamMap.get('skillName');

    // 1️⃣ Cargar mi usuario
    this.accountService.getProfileData().subscribe({
      next: (me) => {
        this.myUser.set(me);
        if (me.skills?.length > 0) {
          this.selectedTeachSkill.set(me.skills[0]);
        }
      }
    });

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

          this.targetUserInterests.set([
            {
              id: selectedSkill,
              name: selectedSkill,
              selected: true,
              image: this.assignImageToSkill(user.skillCategory, selectedSkill)
            }
          ]);
        }
      });
    }
  }

  chooseTeachSkill(skill: any) {
    this.selectedTeachSkill.set(skill);
  }

  createSwap() {
    const mySkill = this.selectedTeachSkill();
    const targetSkill = this.selectedTargetSkill();
    const target = this.targetUser();
    const me = this.myUser();

    if (!mySkill || !targetSkill || !target || !me) return;

    const payload = {
      requesterId: me.username,
      targetId: target.userId,
      learnSkill: targetSkill.skillName,
      teachSkill: mySkill.name
    };

    this.searchService.sendSwapRequest(payload).subscribe(() => {
      alert("Intercambio creado correctamente");
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

    return undefined;
  }
}
