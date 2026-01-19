import { Injectable } from '@angular/core';
import { AccountService } from './account.service';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RedirectionService {
  constructor(
    private accountService: AccountService,
    private router: Router
  ) { }

  checkProfile(): Observable<any> {
    return this.accountService.getProfileData().pipe(
      tap((profile: { skills: string | any[]; interests: string | any[]; }) => {
        if (!profile.skills || profile.skills.length === 0) {
          this.router.navigate(['/skills']);
        } else if (!profile.interests || profile.interests.length === 0) {
          this.router.navigate(['/interests']);
        }
      })
    );
  }

}
