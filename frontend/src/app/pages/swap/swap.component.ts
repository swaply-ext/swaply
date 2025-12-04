import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppNavbarComponent } from '../../components/app-navbar/app-navbar.component';
import { AccountService } from '../../services/account.service';
import { HttpClient } from '@angular/common/http';
import { SearchService, UserSwapDTO } from '../../services/search.services';

// Definimos un tipo para el perfil del usuario
interface UserProfile {
  username: string;
  name: string;
  location?: string;
  skills?: any[];
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

  constructor(
    private route: ActivatedRoute,
    private accountService: AccountService,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    const targetUserId = this.route.snapshot.paramMap.get('targetId');
    console.log('TargetId obtenido de la ruta:', targetUserId);

    // cargar mis datos
    this.accountService.getProfileData().subscribe((me: UserProfile) => {
      this.myUser.set(me);
    });

    // cargar datos del usuario objetivo
    if (targetUserId) {
      this.searchService.getMatches('').subscribe((users: UserSwapDTO[]) => {
        const user: UserSwapDTO | null = users.find((u: UserSwapDTO) => u.userId === targetUserId) || null;
        this.targetUser.set(user);

        // VERIFICAR usuario encontrado
      console.log('Usuario objetivo encontrado:', user);
      });
    }
  }

  chooseTeachSkill(skill: any) {
    this.selectedTeachSkill.set(skill);
  }

  createInterest() {
    if (!this.selectedTeachSkill()) return;

    const payload = {
      requesterId: this.myUser()?.username,
      targetId: this.targetUser()?.userId,
      learnSkill: this.targetUser()?.skillName, 
      teachSkill: this.selectedTeachSkill()?.id
    };

    console.log("Enviando interés", payload);
    // TODO: llamar a tu endpoint real POST /api/interests
  }
}
