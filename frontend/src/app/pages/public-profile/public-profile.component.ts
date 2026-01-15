import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AppNavbarComponent } from "../../components/app-navbar/app-navbar.component";
import { ProfileInfoComponent } from "../../components/profile-info/profile-info.component";
import { SkillsPanelComponent } from '../../components/skills-panel/skills-panel.component';
import { InterestsPanelComponent } from '../../components/interests-panel/interests-panel.component';

import { AccountService } from '../../services/account.service';
import { UserLocation } from '../../models/user.models';
import { UserSkills } from '../../models/skills.models';
import { PrivateProfileData } from '../../models/data.models';



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

public interests: UserSkills[] = [];
  public skills: UserSkills[] = [];
public privateProfileData: PrivateProfileData = {} as PrivateProfileData;
public clasesImpartidas: any[] = [];
public isHistoryOpen: boolean = true; 

  constructor(
    private accountService: AccountService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const usernameFromUrl = params.get('username');
      if (usernameFromUrl) {
        this.getPublicProfileFromBackend(usernameFromUrl);
      }
    });
}

  getPublicProfileFromBackend(username: string): void {
    this.accountService.getPublicProfile(username).subscribe({
      next: (user: any) => {
        // Log vital para ver que datos llegan del backend
        console.log(' [PublicProfile] Datos del usuario publico recibidos del backend:', user);
        this.splitAndSendUser(user);
      },
      error: (err: any) => console.error('Error cargando perfil:', err)
    });
  }

splitAndSendUser(user: any): void {
if (!user) return;
    // MAPPING SEGURO esto quita l'error "Type 'Skill[]' is not assignable..."
    this.skills = this.mapToUserSkills(user.skills);
    this.interests = this.mapToUserSkills(user.interests)

this.generateClassesFromSkills(this.skills);
this.mapPrivateProfileData(user);
}


//normalitzar les skills
    private mapToUserSkills(list: any[]): UserSkills[] {
    if (!list || !Array.isArray(list)) return [];

    return list.map(item => {
      const rawId = item.id || item.skillName || item.name || 'unknown';
      
      return {
        id: rawId.toString(), 
        level: item.level || 0 
      };
    });
  }
mapPrivateProfileData(user: PrivateProfileData): void {
this.privateProfileData = {
fullName: user.fullName,
username: user.username,
location: user.location,
description: user.description || '',
profilePhotoUrl: user.profilePhotoUrl || 'assets/people_demo/user_placeholder.png',
rating: user.rating || 0, 
};
}
/// Esto es ESTATICO PARA LA DEMO YA NO LO UTILIZAMOS IGNORALO
  generateClassesFromSkills(skills: UserSkills[]): void {
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

if (!skills) return;


skills.forEach((skill, index) => {
  // skill es de UserSkills con id
const originalId = skill.id.toLowerCase().trim();

if (originalId === 'unknown') return;
const fileName = fileMapper[originalId] || originalId;


let category = 'leisure'; 
if (sportsList.includes(fileName)) category = 'sports';
      else if (musicList.includes(fileName)) category = 'music';

this.clasesImpartidas.push({
user: fakeStudents[index % fakeStudents.length].name,
userImg: fakeStudents[index % fakeStudents.length].img,
img: `assets/photos_skills/${category}/${fileName}.jpg`,
titulo: `Clase de ${originalId.charAt(0).toUpperCase() + originalId.slice(1)}`, 
        rating: (4.0 + Math.random()).toFixed(1)
});
});
}

toggleHistory(): void {
this.isHistoryOpen = !this.isHistoryOpen;
}
}
