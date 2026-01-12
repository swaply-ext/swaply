import { Component, OnChanges, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PrivateProfileData } from '../../models/private-profile-data.model';
// import { UserLocation } from '../../models/user-location.model';
import { UserSkills} from '../../models/skills.models';



@Component({
  selector: 'app-profile-info',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile-info.component.html',
  styleUrls: ['./profile-info.component.css']
})
export class ProfileInfoComponent implements OnChanges {
  @Input() profileData!: PrivateProfileData;

  // SOLUCIÓN: Añadimos el input para que Angular no de error
  @Input() isReadOnly: boolean = false;
  @Input() isPublic: boolean = false;
  @Input() skills: UserSkills[] = [];

  ngOnChanges(): void {
    console.log('ProfileData changed:', this.profileData);
  }

  constructor(private authService: AuthService, private router: Router ) { }
  starsArray = [1, 2, 3, 4, 5];

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  goToEdit(){
    // Evitamos navegar si es solo lectura
    if (!this.isReadOnly) {
      this.router.navigate(['/profile-edit']);
    }
  }

  goToSwap(): void {
    if (!this.profileData?.username) return;

    const targetUsername = this.profileData.username;
    let queryParms: any = {};

    // cojemos la primera skill por defecto
    if (this.skills && this.skills.length > 0) {
      const defaultSkill = this.skills[0];
      queryParms = {
        skillName: defaultSkill.id,
        level: defaultSkill.level
      };
    }

    this.router.navigate(['/swap', targetUsername], { queryParams: queryParms });
  }
}
