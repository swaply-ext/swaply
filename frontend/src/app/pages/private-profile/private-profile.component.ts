import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNavbarComponent } from "../../components/app-navbar/app-navbar.component";
import { ProfileInfoComponent } from "../../components/profile-info/profile-info.component";
import { SkillsPanelComponent } from '../../components/skills-panel/skills-panel.component';
import { InterestsPanelComponent } from '../../components/interests-panel/interests-panel.component';
import { AccountService } from '../../services/account.service';
import { ActivatedRoute } from '@angular/router'; //Con este import se accede al resolver
import { PrivateProfileData, ProfileDataDTO } from '../../models/data.models';
import { UserSkills } from '../../models/skills.models';
import { RedirectionService } from '../../services/redirection.service';

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
  public profileViewData!: PrivateProfileData;

  constructor(
    private accountService: AccountService, 
    private resolver: ActivatedRoute,
    private redirectionService: RedirectionService
  ) { } //declaramos el resolver

  ngOnInit(): void {
    //En lugar de llamar al servicio, llamamos al resolver
    const user = this.resolver.snapshot.data['profileData'];
    this.splitAndSendUser(user);
    this.redirectionService.checkProfile().subscribe();
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
      rating: 0
    };
  }
}
