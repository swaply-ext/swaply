import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNavbarComponent } from "../../components/app-navbar/app-navbar.component";
import { ProfileInfoComponent } from "../../components/profile-info/profile-info.component";
import { SkillsPanelComponent } from '../../components/skills-panel/skills-panel.component';
import { InterestsPanelComponent } from '../../components/interests-panel/interests-panel.component';
import { RouterLink } from '@angular/router';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-private-profile',
  standalone: true,
  imports: [ //hay que importar los componentes que usemos
    CommonModule,
    AppNavbarComponent,
    ProfileInfoComponent,
    SkillsPanelComponent,
    InterestsPanelComponent,
    RouterLink
  ],
  templateUrl: './private-profile.component.html',
  styleUrls: ['./private-profile.component.css']
})
export class PrivateProfileComponent implements OnInit {

  constructor(private accountService: AccountService) {}

  ngOnInit(): void {
    this.getProfileDataFromBackend();
  }

  getProfileDataFromBackend(): void {
    this.accountService.getProfileData().subscribe({
      next: (data) => {
        console.log('Datos recibidos del backend:', data);
      },
      error: (err) => {
        console.error('Error al obtener datos del perfil:', err);
      }
    });
  }
}