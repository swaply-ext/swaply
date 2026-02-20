import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { UserSkills } from '../models/user-skills.model';
import { AccountService } from './account.service'; // Asegúrate que esta ruta sea correcta

@Injectable({
  providedIn: 'root'
})
export class RedirectionService {

  private router = inject(Router);
  private accountService = inject(AccountService);


  checkProfile(): Observable<boolean> {
    return this.accountService.getProfileData().pipe(
      tap((profile: any) => {

        if (profile && (!profile.username || !profile.location)) {
          this.router.navigate(['/profile/edit']);
        }
      }),
      map(() => true),

      catchError((error) => {
        console.error('Usuario no autenticado o error de perfil', error);
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }

  checkSkillsInterests(skills: UserSkills[] | undefined, interests: UserSkills[] | undefined): Observable<void> {
    if (skills !== undefined && skills.length === 0) {
      this.router.navigate(['/skills']);
    } else if (interests !== undefined && interests.length === 0) {
      this.router.navigate(['/interests']);
    }
    return EMPTY;
  }
}
