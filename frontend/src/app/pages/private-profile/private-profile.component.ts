import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNavbarComponent } from "../../components/app-navbar/app-navbar.component";
import { ProfileInfoComponent } from "../../components/profile-info/profile-info.component";
import { SkillsPanelComponent } from '../../components/skills-panel/skills-panel.component';
import { InterestsPanelComponent } from '../../components/interests-panel/interests-panel.component';
import { AccountService } from '../../services/account.service';

interface Skill {
  id: string;
  level: number;
}

interface Location {
  placeId: string;
  lat: number;
  lon: number;
  displayName: string;
}


interface ProfileData {
  fullName: string;
  username: string;
  location: Location;
  description: string;
  profilePhotoUrl: string;
  rating: number;
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

  public interests: Array<Skill> = [];
  public skills: Array<Skill> = [];
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
    this.interests = user.interests;
    this.skills = user.skills;
    this.mapProfileData(user);
    console.log(this.skills);
    console.log(this.interests);
  }

  mapProfileData(user: any): void {

    this.profileData = {
      fullName: `${user.name} ${user.surname}`,
      username: user.username,
      location: user.location,
      description: user.description,
      profilePhotoUrl: user.profilePhotoUrl,
      rating : 3.8,
    };
  }


}
