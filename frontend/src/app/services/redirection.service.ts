import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, Observable } from 'rxjs';
import { UserSkills } from '../models/user-skills.model';

@Injectable({
  providedIn: 'root'
})
export class RedirectionService {
  constructor(
    private router: Router
  ) { }

  //se usa undefined para los arrays porque al principio pueden no estar cargados
  checkSkillsInterests(skills: UserSkills[] | undefined, interests: UserSkills[] | undefined): Observable<void> {
    if (!skills || skills.length === 0) {
      this.router.navigate(['/skills']);
    } else if (!interests || interests.length === 0) {
      this.router.navigate(['/interests']);
    }
    return EMPTY;
  }

}
