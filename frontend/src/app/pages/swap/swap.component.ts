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

  constructor(
    private route: ActivatedRoute,
    private accountService: AccountService,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    const targetUserId = this.route.snapshot.paramMap.get('targetId');
    console.log('TargetId obtenido de la ruta:', targetUserId);

    // Cargar mis datos
    this.accountService.getProfileData().subscribe({
      next: (me: UserProfile) => {
        this.myUser.set(me);
        console.log('Mis datos cargados:', me);

        // Seleccionamos automáticamente la primera skill si existe
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
            console.log('Usuario objetivo encontrado:', user);
          } else {
            console.warn('Usuario objetivo no encontrado para targetId:', targetUserId);
          }
        },
        error: (err) => console.error('Error al obtener usuario objetivo:', err)
      });
    } else {
      console.warn('No se encontró targetId en la ruta.');
    }
  }

  chooseTeachSkill(skill: any) {
    this.selectedTeachSkill.set(skill);
  }
  
  createInterest() {
    if (!this.selectedTeachSkill() || !this.targetUser()) return;

    const payload = {
      requesterId: this.myUser()?.username,
      targetId: this.targetUser()?.userId,
      learnSkill: this.targetUser()?.skillName, 
      teachSkill: this.selectedTeachSkill()?.id
    };

    console.log("Enviando interés", payload);
  }
}
