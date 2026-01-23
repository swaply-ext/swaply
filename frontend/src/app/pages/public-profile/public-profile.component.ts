import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AppNavbarComponent } from "../../components/app-navbar/app-navbar.component";
import { ProfileInfoComponent } from "../../components/profile-info/profile-info.component";
import { SkillsPanelComponent } from '../../components/skills-panel/skills-panel.component';
import { InterestsPanelComponent } from '../../components/interests-panel/interests-panel.component';
import { AccountService } from '../../services/account.service';
import { ChatService } from '../../services/chat.service';
import { UsersService } from '../../services/users.service';
import id from '@angular/common/locales/extra/id';
import { UserLocation } from '../../models/user-location.model';
import { UserSkills } from '../../models/user-skills.model';
import { PrivateProfileData } from '../../models/private-profile-data.model';

interface PanelSkill {
  id: string;
  level: number;
}

interface BackendSkill {
  id?: string;
  name?: string;
  skillName?: string;
  level?: number;
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

  public interests: PanelSkill[] = [];
  public skills: PanelSkill[] = [];
  public profileData: ProfileData = {} as ProfileData;
  public clasesImpartidas: any[] = [];
  public isHistoryOpen: boolean = true; 
  public privateProfileData: PrivateProfileData = {} as PrivateProfileData;
  private currentUsername: string = '';


  constructor(
    private accountService: AccountService,
    private userService: UsersService,
    private route: ActivatedRoute,
    private chatService: ChatService,
    private router: Router
  ) { }

  contactUser() {
    const target = this.profileData?.username;
    if (!target) return;
    this.chatService.createRoomWithUsername(target).subscribe({
      next: (room: any) => {
        //Guardamos la ID en el servicio (estado oculto)
        this.chatService.setActiveRoom(room.id);
        //Navegamos al chat limpio
        this.router.navigate(['/chat']);
      },
      error: (err: any) => {
        console.error('Error creando sala', err);
        //Fallback
        this.router.navigate(['/chat']);
      }
    });
  }

  ngOnInit(): void {
    this.userService.getUsername().subscribe({
      next: (data: string) => {
        this.currentUsername = data;
        this.checkUrlParams();
      },
      error: () => {
        this.currentUsername = '';
        this.checkUrlParams();
      }
    });

    this.route.paramMap.subscribe(params => {
      const usernameFromUrl = params.get('username');
      if (usernameFromUrl) {
        this.getPublicProfileFromBackend(usernameFromUrl);
      }
    });
  }

  private checkUrlParams(): void {
    this.route.paramMap.subscribe(params => {
      const usernameFromUrl = params.get('username');

      if (!usernameFromUrl) {
        this.router.navigate(['/error-404']);
        return;
      }

      if (this.currentUsername === usernameFromUrl) {
        this.router.navigate(['/myprofile']);
      } else {
        this.getPublicProfileFromBackend(usernameFromUrl);
      }
    });
  }

  getPublicProfileFromBackend(username: string): void {
    this.accountService.getPublicProfile(username).subscribe({
      next: (user: any) => {
        // Log vital para ver que datos llegan del backend
        console.log(' [PublicProfile] Datos del usuario publico recibidos del backend:', user);
        if (!user) {
          this.router.navigate(['/error-404']);
          return;
        }
        this.splitAndSendUser(user);
      },
      error: (err: any) => {
        console.error('Error cargando perfil:', err);
        this.router.navigate(['/error-404']);
      }
    });
  }

  splitAndSendUser(user: any): void {
    if (!user) return;
    this.skills = this.mapToPanelSkill(user.skills);
    this.interests = this.mapToPanelSkill(user.interests);

    this.generateClassesFromSkills(this.skills);
    this.mapProfileData(user);
  }

  private mapToPanelSkill(list: any[]): PanelSkill[] {
    if (!list || !Array.isArray(list)) return [];

    return list.map(item => {
      const rawId = item.id || item.skillName || item.name || 'unknown';
      return {
        id: rawId.toString(), 
        level: item.level || 0 
      };
    });
  }

  mapProfileData(user: any): void {
    this.profileData = {
      fullName: user.fullName || `${user.name || ''} ${user.surname || ''}`.trim(),
      username: user.username,
      location: user.location,
      description: user.description || '',
      profilePhotoUrl: user.profilePhotoUrl || 'assets/people_demo/user_placeholder.png',
      rating: user.rating || 0, 
    };
  }

  generateClassesFromSkills(skills: PanelSkill[]): void {
    this.clasesImpartidas = [];

    const fakeStudents = [
      { name: 'Marta Díaz', img: 'assets/people_demo/marina_garcia.jpg' },
      { name: 'Juan Pérez', img: 'assets/people_demo/juan_perez.png' },
      { name: 'Carlos R.', img: 'assets/people_demo/carlos_rodriguez.jpg' },
      { name: 'Ana López', img: 'assets/people_demo/ana_lopez.jpg' },
      { name: 'Luis Martín', img: 'assets/people_demo/luis_martin.jpg' }
    ];

    const fileMapper: { [key: string]: string } = {
      'futbol': 'football', 'basquet': 'basketball', 'boxeo': 'boxing',
      'padel': 'padel', 'voley': 'voleyball', 'tenis': 'tennis',
      'guitarra': 'guitar', 'piano': 'piano', 'violin': 'violin',
      'bateria': 'drums', 'saxofon': 'saxophone', 'cocina': 'cook',
      'manualidades': 'crafts', 'baile': 'dance', 'ocio digital': 'digital_entertainment',
      'dibujo': 'draw'
    };

    const sportsList = ['football', 'basketball', 'boxing', 'padel', 'voleyball' ];
    const musicList = ['guitar', 'piano', 'violin', 'drums', 'saxophone'];

    if (!skills) return;

    skills.forEach((skill, index) => {
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