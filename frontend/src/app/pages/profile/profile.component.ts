import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNavbarComponent } from "../../components/app-navbar/app-navbar.component";
import { ProfileInfoComponent } from "../../components/profile-info/profile-info.component";
import { SkillsPanelComponent } from '../../components/skills-panel/skills-panel.component';
import { InterestsPanelComponent } from '../../components/interests-panel/interests-panel.component';
import { PersonalInformationComponent } from "../personal-information/personal-information.component";
import { InterestsComponent } from "../interests/interests.component";


@Component({
  selector: 'app-profile',
  imports: [CommonModule, AppNavbarComponent, ProfileInfoComponent, SkillsPanelComponent, InterestsPanelComponent, PersonalInformationComponent, InterestsComponent],
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

}
