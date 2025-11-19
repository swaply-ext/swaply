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

  // Variables individuales para enlazar con el formulario
  fullName = "";
  username = "";
  description = "";
  birthDate: Date | null = null;
  location = "";
  gender = "";
  email = "";
  profilePhotoUrl = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

  // Variable única para mensajes de error personalizados por campo
  errorMessages: { [key: string]: string } = {};

  ngOnInit(): void {
    this.getProfileDataFromBackend();
  }
  // Obtener datos del perfil desde el backend
  getProfileDataFromBackend(): void {
    this.accountService.getEditProfileData().subscribe({
      next: (user) => {
        this.splitAndSendUser(user);
        console.log('Datos del perfil actuales:', this.profileData);
      },
      error: (err) => {
        console.error('Error al obtener datos del perfil:', err);
      }
    });
  }
  // Dividir y asignar datos del usuario a las variables del componente
  splitAndSendUser(user: any): void {
    this.mapProfileData(user);
  }
  // Mapear datos del usuario a la estructura ProfileData
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
  validate(): boolean {
    // Validar campos obligatorios
    if (!this.gender) this.errorMessages['gender'] = 'El género es obligatorio.';

    // Validar fullName
    if (!this.fullName.trim()) {
      this.errorMessages['fullName'] = 'El nombre completo es obligatorio.';
    } else {
      delete this.errorMessages['fullName'];
    }
    // Validar username
    if (!this.username.trim()) {
      this.errorMessages['username'] = 'El nombre de usuario es obligatorio.';
    } else if (this.validateUsernameFormat(this.username)) {
      this.errorMessages['username'] = 'El nombre de usuario debe tener entre 3 y 30 caracteres, solo letras minúsculas, números, guiones y guiones bajos.';
    } else {
      delete this.errorMessages['username'];
    }
    // Validar email
    if (!this.email.trim()) {
      this.errorMessages['email'] = 'El correo electrónico es obligatorio.';
    } else if (!this.validateEmail(this.email)) {
      this.errorMessages['email'] = 'El formato debe ser: "ejempplo@ejemplo.com"';
    } else {
      delete this.errorMessages['email'];
    }
    // Validar location
    if (!this.location) {
      this.errorMessages['location'] = 'La ubicación es obligatoria.';
    } else if (this.validateLocationFormat(this.location)) {
      this.errorMessages['location'] = 'La ubicación debe tener entre 3 y 30 caracteres, solo letras y espacios.';
    } else {
      delete this.errorMessages['location'];
    }
    // Validar birthDate
    if (!this.birthDate) {
      this.errorMessages['birthDate'] = 'La fecha de nacimiento es obligatoria.';
    } else if (this.isFutureDate(this.birthDate) || this.isToday(this.birthDate)) {
      this.errorMessages['birthDate'] = 'La fecha de nacimiento no es válida.';
    } else {
      delete this.errorMessages['birthDate'];
    }

    //devolver si hay errores o no
    if (Object.keys(this.errorMessages).length > 0) {
      return false;
    } else {
      return true;
    }
  }
  private refreshPage() {
    window.location.reload();
  }
  private validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  private validateUsernameFormat(username: string): boolean {
    const minLength = 3;
    const maxLength = 30;
    const requeriments = /^[a-z0-9_-]+$/

    if (username.length < minLength) return true;
    if (username.length > maxLength) return true;
    if (!requeriments.test(username)) return true;
    else return false;
  }
  private validateLocationFormat(location: string): boolean {
    const minLength = 3;
    const maxLength = 30;
    const requeriments = /^[A-Za-z ]+$/

    if (location.length < minLength) return true;
    if (location.length > maxLength) return true;
    if (!requeriments.test(location)) return true;
    else return false;
  }
  private isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  private isFutureDate(date: Date): boolean {
    const today = new Date();
    return date > today;
  }

  save() {
    // Resetear errores al inicio
    this.errorMessages = {};
    // Validar los campos del formulario
    this.validate();

    // Si hay errores, no continuar
    if (Object.keys(this.errorMessages).length > 0) {
      console.error('No se pudo actualizar el perfil: campos obligatorios incompletos o formatos inválidos.');
      return;
    }
    //recoger los datos del formulario
    const updatedUser: ProfileData = {
      fullName: this.fullName,
      username: this.username.toLowerCase(),
      description: this.description,
      birthDate: this.birthDate,
      location: this.location,
      gender: this.gender,
      email: this.email.toLowerCase(),
      profilePhotoUrl: this.profilePhotoUrl
    };
    //llamar al servicio para actualizar los datos y sobrecribir los datos actuales
    this.accountService.updateEditProfileData(updatedUser).subscribe({
      next: (success) => {
        if (success) {
          console.log('Perfil actualizado con éxito.');
        } else {
          console.error('Error al actualizar el perfil: respuesta negativa del servidor.');
        }
      },
      error: (err) => {
        console.error('Error al actualizar el perfil:', err);
      }
    });
    this.refreshPage();
  }
}
