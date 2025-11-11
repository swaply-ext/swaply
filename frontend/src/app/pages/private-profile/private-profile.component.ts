import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNavbarComponent } from "../../components/app-navbar/app-navbar.component";
import { ProfileInfoComponent } from "../../components/profile-info/profile-info.component";
import { SkillsPanelComponent } from '../../components/skills-panel/skills-panel.component';
import { InterestsPanelComponent } from '../../components/interests-panel/interests-panel.component';
import { AccountService } from '../../services/account.service';

interface Skill {
  name: string;
  level: string;
}

interface ProfileData {
  fullName: string;
  username: string;
  location: string;
  description: string;
  profilePhotoUrl: string;
}
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

  public isPublic: boolean = false;
  public interests: Array<Skill> = [];
  public skills: Array<Skill> = [];
  private levels: string[] = ['low', 'mid', 'high'];
  public profileData: ProfileData = {} as ProfileData;

  constructor(private accountService: AccountService) { }

  ngOnInit(): void {
    this.getProfileDataFromBackend();
  }

  getProfileDataFromBackend(): void {
    this.accountService.getProfileData().subscribe({
      next: (user) => {
        // console.log('Datos recibidos del backend:', data);
        this.splitAndSendUser(user);
      },
      error: (err) => {
        console.error('Error al obtener datos del perfil:', err);
      }
    });
  }

  splitAndSendUser(user: any): void {
    this.interests = this.levelToString(user.interests);
    this.skills = this.levelToString(user.skills);
    this.mapProfileData(user);
    console.log('Intereses mapeados:', this.profileData);
  }

  mapProfileData(user: any): void {

    this.profileData = {
      fullName: `${user.name} ${user.surname}`,
      username: user.username,
      location: user.location,
      description: user.description,
      profilePhotoUrl: user.profilePhotoUrl
    };
  }

  levelToString(skills: Array<Skill>): Array<Skill> {
    skills.forEach(skill => {
      skill.level = this.levels[parseInt(skill.level) - 1];
    });
    return skills;
  }

}