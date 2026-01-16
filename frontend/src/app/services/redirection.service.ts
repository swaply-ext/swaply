import { inject, Injectable } from '@angular/core';
import { AccountService } from './account.service';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { SkillData } from '../models/data.models';

@Injectable({
  providedIn: 'root'
})
export class RedirectionService {

  private accountService = inject(AccountService);
  private router = inject(Router);

  checkProfile(): Observable<SkillData> {
    return this.accountService.getProfileData().pipe(
      tap(profile => {
        if (!profile.skills || profile.skills.length === 0) {
          this.router.navigate(['/skills']);
        } else if (!profile.interests || profile.interests.length === 0) {
          this.router.navigate(['/interests']);
        }
      })
    );
  }

}
