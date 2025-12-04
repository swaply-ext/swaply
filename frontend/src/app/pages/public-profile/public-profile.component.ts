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

interface ProfileData {
  fullName: string;
  username: string;
  location: string;
  description: string;
  profilePhotoUrl: string;
  rating: number;
}

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [
    CommonModule,
    AppNavbarComponent,
    ProfileInfoComponent,
    SkillsPanelComponent,
    InterestsPanelComponent
  ],
  templateUrl: './public-profile.component.html',
  styleUrls: ['./public-profile.component.css']
})
export class PublicProfileComponent implements OnInit {

  public interests: Array<Skill> = [];
  public skills: Array<Skill> = [];
  public profileData: ProfileData = {} as ProfileData;
  public clasesImpartidas: any[] = [];
  public isHistoryOpen: boolean = true; 

  constructor(private accountService: AccountService) { }

  ngOnInit(): void {
    this.getProfileDataFromBackend();
  }

  getProfileDataFromBackend(): void {
    this.accountService.getProfileData().subscribe({
      next: (user: any) => this.splitAndSendUser(user),
      error: (err: any) => console.error(err)
    });
  }

  splitAndSendUser(user: any): void {
    this.interests = user.interests || [];
    this.skills = user.skills || []; 
    
    this.generateClassesFromSkills(this.skills);
    this.mapProfileData(user);
  }

  mapProfileData(user: any): void {
    this.profileData = {
      fullName: `${user.name} ${user.surname}`,
      username: user.username,
      location: user.location,
      description: user.description || '',
      profilePhotoUrl: user.profilePhotoUrl || 'assets/people_demo/user_placeholder.png',
      rating: user.rating || 0, 
    };
  }
  /// Esto es DEMO
  generateClassesFromSkills(skills: Skill[]): void {
    this.clasesImpartidas = [];
    
    const fakeStudents = [
      { name: 'Marta Díaz', img: 'assets/people_demo/marina_garcia.jpg' },
      { name: 'Juan Pérez', img: 'assets/people_demo/juan_perez.png' },
      { name: 'Carlos R.', img: 'assets/people_demo/carlos_rodriguez.jpg' },
      { name: 'Ana López', img: 'assets/people_demo/ana_lopez.jpg' },
      { name: 'Luis Martín', img: 'assets/people_demo/luis_martin.jpg' }
    ];

    const fileMapper: { [key: string]: string } = {
      
      'futbol': 'football',
      'basquet': 'basketball',
      'boxeo': 'boxing',
      'padel': 'padel',
      'voley': 'voleyball', 
      'tenis': 'tennis',    

  
      'guitarra': 'guitar',
      'piano': 'piano',
      'violin': 'violin',
      'bateria': 'drums',
      'saxofon': 'saxophone',

      'cocina': 'cook',
      'manualidades': 'crafts',
      'baile': 'dance',
      'ocio digital': 'digital_entertainment',
      'dibujo': 'draw'
    };

    const sportsList = ['football', 'basketball', 'boxing', 'padel', 'voleyball' ];
    const musicList = ['guitar', 'piano', 'violin', 'drums', 'saxophone'];
  

    skills.forEach((skill, index) => {
      const originalId = skill.id.toLowerCase().trim();
      
      const fileName = fileMapper[originalId] || originalId;

    
      let category = 'leisure'; 
      if (sportsList.includes(fileName)) {
        category = 'sports';
      } else if (musicList.includes(fileName)) {
        category = 'music';
      }

      this.clasesImpartidas.push({
        user: fakeStudents[index % fakeStudents.length].name,
        userImg: fakeStudents[index % fakeStudents.length].img,
        img: `assets/photos_skills/${category}/${fileName}.jpg`,
        titulo: `Clase de ${skill.id.charAt(0).toUpperCase() + skill.id.slice(1)}`, 
        rating: (4.0 +Math.random()).toFixed(1)
      });
    });
  }

  toggleHistory(): void {
    this.isHistoryOpen = !this.isHistoryOpen;
  }
}
