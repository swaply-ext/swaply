import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNavbarComponent } from "../../components/app-navbar/app-navbar.component";
import { ProfileInfoComponent } from "../../components/profile-info/profile-info.component";
import { SkillsPanelComponent } from '../../components/skills-panel/skills-panel.component';
import { InterestsPanelComponent } from '../../components/interests-panel/interests-panel.component';
import { AccountService } from '../../services/account.service';
import { ProfileDataDTO } from '../../models/profile-data-dto.model';
import { ProfileData } from '../../models/private-profile-data.model';
import { UserSkills } from '../../models/user-skills.model';
import { ActivatedRoute } from '@angular/router'; //Con este import se peude acceder al resolver

@Component({
  selector: 'app-private-profile',
  standalone: true,
  imports: [ //hay que importar los componentes que usemos
    CommonModule,
    AppNavbarComponent,
    ProfileInfoComponent,
    SkillsPanelComponent,
    InterestsPanelComponent
  ],
  templateUrl: './private-profile.component.html',
  styleUrls: ['./private-profile.component.css']
})
export class PrivateProfileComponent implements OnInit {

  public interests: Array<UserSkills> = [];
  public skills: Array<UserSkills> = [];
  public profileViewData!: ProfileData;
  // public profileData: ProfileData = {} as ProfileData;

  constructor(private accountService: AccountService, private resolver: ActivatedRoute) { } //declaramos el resolver

  ngOnInit(): void {
    // Accedemos directamente al snapshot del resolver para obtener los datos
    const user = this.resolver.snapshot.data['profileData'];
    this.splitAndSendUser(user);
  }

  splitAndSendUser(user: ProfileDataDTO): void {
    this.interests = user.interests;
    this.skills = user.skills;
    this.mapProfileData(user);
    console.log(this.skills);
    console.log(this.interests);
  }

  mapProfileData(user: ProfileDataDTO): void {
    this.profileViewData = {
      fullName: `${user.name} ${user.surname}`,
      username: user.username,
      location: user.location,
      description: user.description,
      profilePhotoUrl: user.profilePhotoUrl,
    };
  }
}
