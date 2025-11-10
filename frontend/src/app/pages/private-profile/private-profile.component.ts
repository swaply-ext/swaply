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

  public isPublic: boolean = true;
  public interests: Array<object> = [];
  public skills: Array<Skill> = [];
  private levels: string[] = ['low', 'mid', 'high'];

  constructor(private accountService: AccountService) { }

  ngOnInit(): void {
    this.getProfileDataFromBackend();
  }

  getProfileDataFromBackend(): void {
    this.accountService.getProfileData().subscribe({
      next: (data) => {
        // console.log('Datos recibidos del backend:', data);
        this.splitAndSendData(data);
      },
      error: (err) => {
        console.error('Error al obtener datos del perfil:', err);
      }
    });
  }
  
  splitAndSendData(data: any): void {
    console.log(data);
    this.interests = this.levelToString(data.interests);
    this.skills = this.levelToString(data.skills);
  }
  
  levelToString(skills: Array<Skill>): Array<Skill>{
    skills.forEach(skill => {
      skill.level = this.levels[parseInt(skill.level) - 1];
    });
    return skills;
  }

}