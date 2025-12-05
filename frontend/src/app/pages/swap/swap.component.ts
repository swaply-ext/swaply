import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppNavbarComponent } from '../../components/app-navbar/app-navbar.component';
import { AccountService } from '../../services/account.service';
import { SearchService, UserSwapDTO } from '../../services/search.services';

interface UserProfile {
  username: string;
  name: string;
  location?: string;
  skills?: any[];
  profilePhotoUrl?: string;
}

@Component({
  selector: 'app-swap',
  standalone: true,
  imports: [CommonModule, AppNavbarComponent],
  templateUrl: './swap.component.html',
  styleUrls: ['./swap.component.css']
})
export class SwapComponent implements OnInit {

  myUser = signal<UserProfile | null>(null);
  targetUser = signal<UserSwapDTO | null>(null);
  selectedTeachSkill = signal<any>(null);
  
  selectedTargetSkill = signal<{ skillName: string, skillIcon?: string, skillImage?: string, location?: string } | null>(null);

  constructor(
    private route: ActivatedRoute,
    private accountService: AccountService,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    const targetUserId = this.route.snapshot.paramMap.get('targetId');
    const skillName = this.route.snapshot.queryParamMap.get('skillName'); 

    // Cargar mis datos
    this.accountService.getProfileData().subscribe({
      next: (me: UserProfile) => {
        this.myUser.set(me);
        if(me.skills && me.skills.length > 0) {
          this.selectedTeachSkill.set(me.skills[0]);
        }
      },
      error: (err) => console.error('Error al cargar mi perfil:', err)
    });

    // Cargar datos del usuario objetivo
    if (targetUserId) {
      this.searchService.getUserById(targetUserId).subscribe({
        next: (user) => {
          if (user) {
            this.targetUser.set(user);

            this.selectedTargetSkill.set({
              skillName: skillName || user.skillName,
              skillIcon: user.skillIcon,
              skillImage: this.assignImageToSkill(user.skillCategory, skillName || user.skillName),
              location: user.location
            });
          }
        },
        error: (err) => console.error('Error al obtener usuario objetivo:', err)
      });
    }
  }

  chooseTeachSkill(skill: any) {
    this.selectedTeachSkill.set(skill);
  }

  createInterest() {
    if (!this.selectedTeachSkill() || !this.targetUser() || !this.selectedTargetSkill()) return;

    const payload = {
      requesterId: this.myUser()?.username,
      targetId: this.targetUser()?.userId,
      learnSkill: this.selectedTargetSkill()?.skillName, 
      teachSkill: this.selectedTeachSkill()?.id
    };

    console.log("Enviando interés", payload);
  }

  getTargetSkillName() {
    return this.selectedTargetSkill()?.skillName || '';
  }

  getTargetSkillImage() {
    return this.selectedTargetSkill()?.skillImage || this.selectedTargetSkill()?.skillIcon || 'assets/default-avatar.png';
  }

  private assignImageToSkill(category: string, skillName: string): string | undefined {
    if (!skillName) return undefined;
    const name = skillName.toLowerCase();
    let folder = 'leisure';

    if (category) {
      const cat = category.toLowerCase();
      if (cat.includes('deporte') || cat.includes('sports')) folder = 'sports';
      if (cat.includes('música') || cat.includes('musica')) folder = 'music';
    }

    let filename = '';
    if (name.includes('fútbol') || name.includes('futbol')) filename = 'football.jpg';
    else if (name.includes('pádel') || name.includes('padel')) filename = 'padel.jpg';
    else if (name.includes('basquet') || name.includes('baloncesto') || name.includes('basket')) filename = 'basketball.jpg';
    else if (name.includes('vóley') || name.includes('voley')) filename = 'voleyball.jpg';
    else if (name.includes('boxeo')) filename = 'boxing.jpg';
    else if (name.includes('guitarra')) filename = 'guitar.jpg';
    else if (name.includes('piano')) filename = 'piano.jpg';
    else if (name.includes('violín') || name.includes('violin')) filename = 'violin.jpg';
    else if (name.includes('batería') || name.includes('bateria')) filename = 'drums.jpg';
    else if (name.includes('saxofón') || name.includes('saxofon')) filename = 'saxophone.jpg';
    else if (name.includes('dibujo')) filename = 'draw.jpg';
    else if (name.includes('cocina')) filename = 'cook.jpg';
    else if (name.includes('baile') || name.includes('dance')) filename = 'dance.jpg';
    else if (name.includes('manualidades')) filename = 'crafts.jpg';
    else if (name.includes('digital')) filename = 'digital_entertainment.jpg';

    if(filename) return `assets/photos_skills/${folder}/${filename}`;
    return undefined;
  }
}
