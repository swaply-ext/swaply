import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppNavbarComponent } from "../../components/app-navbar/app-navbar.component";
import { SideMenuComponent } from '../../components/side-menu/side-menu.component';
import { SaveButtonComponent } from '../../components/save-button/save-button.component';
import { AccountService } from '../../services/account.service';


interface ProfileData {
  fullName: string;
  username: string;
  description: string;
  birthDate: Date | null;
  location: string;
  gender: string;
  email: string;
  profilePhotoUrl: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppNavbarComponent,
    SideMenuComponent,
    SaveButtonComponent
  ],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css'] 
})
export class EditProfileComponent implements OnInit {
  public profileData: ProfileData = {} as ProfileData;
  constructor(private accountService: AccountService) { }

  fullName = "";
  username = "";
  description = "";
  birthDate: Date | null = null;
  location = "";
  gender = "";
  email = "";
  profilePhotoUrl = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';


  ngOnInit(): void {
    this.getProfileDataFromBackend();
  }

  getProfileDataFromBackend(): void {
    this.accountService.getEditProfileData().subscribe({
      next: (user) => {
        // console.log('Datos recibidos del backend:', data);
        this.splitAndSendUser(user);
        console.log('Datos del perfil actuales:', this.profileData);
      },
      error: (err) => {
        console.error('Error al obtener datos del perfil:', err);
      }
    });
  }
  splitAndSendUser(user: any): void {
    // this.interests = this.levelToString(user.interests);
    // this.skills = this.levelToString(user.skills);
    this.mapProfileData(user);
  }
  

  mapProfileData(user: any): void {
  this.profileData = {
    fullName: `${user.name} ${user.surname}`,
    username: user.username,
    description: user.description,
    location: user.location,
    birthDate: user.birthDate ? new Date(user.birthDate) : null,
    gender: user.gender,
    email: user.email,
    profilePhotoUrl: user.profilePhotoUrl
  };

  // Asignar también a las variables individuales que usa el template
  this.fullName = this.profileData.fullName;
  this.username = this.profileData.username;
  this.description = this.profileData.description;
  this.location = this.profileData.location;
  this.birthDate = this.profileData.birthDate;
  this.gender = this.profileData.gender;
  this.email = this.profileData.email;
  this.profilePhotoUrl = this.profileData.profilePhotoUrl;
  }
  onBirthDateChange(event: string): void {
  this.birthDate = new Date(event);
  this.profileData.birthDate = this.birthDate;
  }



  save() {

    if (!this.fullName || !this.username || !this.birthDate || !this.location || !this.gender || !this.email) {
      console.error('No se pudo actualizar el perfil: campos obligatorios incompletos.');
      return;
    }
    const updatedUser: ProfileData = {
      fullName: this.fullName,
      username: this.username,
      description: this.description,
      birthDate: this.birthDate,
      location: this.location,
      gender: this.gender,
      email: this.email,
      profilePhotoUrl: this.profilePhotoUrl
    };
    
    // Simulación de guardado
    console.log('Guardando cambios del usuario:'
      + '\nfullName: ' + this.fullName
      + '\nusername: ' + this.username
      + '\ndescription: ' + this.description
      + '\nemail: ' + this.email
      + '\nbirthDate: ' + this.birthDate
      + '\nlocation: ' + this.location
      + '\ngender: ' + this.gender
    );
    // Aquí iría la lógica para enviar los datos al backend
  }

}
