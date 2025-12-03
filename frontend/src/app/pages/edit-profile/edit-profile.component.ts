import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppNavbarComponent } from "../../components/app-navbar/app-navbar.component";
import { SideMenuComponent } from '../../components/side-menu/side-menu.component';
import { SaveButtonComponent } from '../../components/save-button/save-button.component';
import { AccountService } from '../../services/account.service';
import { DiscardButtonComponent } from '../../components/discard-button/discard-button.component';
import { SkillsPanelComponent } from '../../components/skills-panel/skills-panel.component';
import { InterestsPanelComponent } from '../../components/interests-panel/interests-panel.component';
interface Skill {
  id: string;
  level: number;
}

interface ProfileData {
  name: string;
  surname: string;
  username: string;
  description: string;
  birthDate: string;
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
    SaveButtonComponent,
    DiscardButtonComponent,
    SkillsPanelComponent,
    InterestsPanelComponent
  ],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {
  public interests: Array<Skill> = [];
  public skills: Array<Skill> = [];
  public profileData: ProfileData = {} as ProfileData;

  isUploadingPhoto = false;

  constructor(private accountService: AccountService) { }

  // Variables individuales para enlazar con el formulario
  name = "";
  surname = "";
  username = "";
  description = "";
  birthDate: string = "";
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
        console.log('Datos recibidos del backend', user);
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
    console.log(this.interests)
  }

  // Mapear datos del usuario a la estructura ProfileData
  mapProfileData(user: any): void {
    this.profileData = {
      name: user.name,
      surname: user.surname,
      username: user.username,
      description: user.description,
      location: user.location,
      birthDate: user.birthDate ? new Date(user.birthDate).toISOString().substring(0, 10) : '',
      gender: user.gender,
      email: user.email,
      profilePhotoUrl: user.profilePhotoUrl || this.profilePhotoUrl
    };

    // Asignar también a las variables individuales que usa el template
    this.name = this.profileData.name;
    this.surname = this.profileData.surname;
    this.username = this.profileData.username;
    this.description = this.profileData.description;
    this.location = this.profileData.location;
    this.birthDate = this.profileData.birthDate;
    this.gender = this.profileData.gender;
    this.email = this.profileData.email;
    if(this.profileData.profilePhotoUrl) {
        this.profilePhotoUrl = this.profileData.profilePhotoUrl;
    }
  }

  onPhotoSelected(event: any): void {
    const file = event.target.files[0];
    
    // Resetear error previo
    delete this.errorMessages['profilePhoto'];

    if (file) {
      // validación del formato
      const validExtensions = ['jpeg', 'jpg', 'png', 'webp', 'heic', 'heif'];
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (!fileExtension || !validExtensions.includes(fileExtension)) {
        this.errorMessages['profilePhoto'] = 'Solo se permiten imágenes JPG, PNG, WEBP, HEIC o HEIF.';
        return;
      }
      // Validación de tamaño (2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.errorMessages['profilePhoto'] = 'La imagen es demasiado grande. Máximo 2MB.';
        return;
      }

      this.isUploadingPhoto = true;

      // Subimos directamente al backend (que lo subirá a Azure)
      this.accountService.uploadProfilePhoto(file).subscribe({
        next: (url) => {
          console.log('Foto subida correctamente:', url);
          // Actualizamos la vista con la nueva URL de Azure
          this.profilePhotoUrl = url; 
          this.isUploadingPhoto = false;
        },
        error: (err) => {
          console.error('Error subiendo foto:', err);
          this.isUploadingPhoto = false;
        }
      });
    }
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
      name: this.name,
      surname: this.surname,
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
          window.location.reload();
        } else {
          console.error('Error al actualizar el perfil: respuesta negativa del servidor.');
        }
      },
      error: (err) => {
        console.error('Error al actualizar el perfil:', err);

        // Detectar si el usuario ya existen 
        if (err.status === 409) {
          if (this.username.toLowerCase() === this.profileData.username.toLowerCase()) {
            console.log('El nombre de usuario es el mismo que el actual, no se muestra error.');
          } else {
            this.errorMessages['username'] = 'El nombre de usuario ya está en uso. Por favor, elige otro diferente.';
          }
        }
      }
    });
  }
  discard() {
    this.refreshPage();
  }

  validate(): boolean {
    // Validar campos obligatorios
    if (!this.gender) this.errorMessages['gender'] = 'El género es obligatorio.';

    // Validar name y surname
    if (!this.name.trim()) {
      this.errorMessages['name'] = 'El nombre completo es obligatorio.';
    } else {
      delete this.errorMessages['name'];
    }
    if (!this.surname.trim()) {
      this.errorMessages['surname'] = 'El apellido es obligatorio.';
    } else {
      delete this.errorMessages['surname'];
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
      this.errorMessages['location'] = 'La ubicación debe tener entre 3 y 30 caracteres. Solo letras, espacios, comas y guiones.';
    } else {
      delete this.errorMessages['location'];
    }
    // Validar birthDate
    if (!this.birthDate) {
      this.errorMessages['birthDate'] = 'La fecha de nacimiento es obligatoria.';
    } else {
      const date = new Date(this.birthDate);

      if (this.isFutureDate(date) || this.isToday(date)) {
        this.errorMessages['birthDate'] = 'La fecha de nacimiento no es válida.';
      } else {
        const age = this.calculateAge(date);
        if (age < 18 || age > 120) {
          this.errorMessages['birthDate'] = 'La edad debe estar entre 18 y 120 años.';
        } else {
          delete this.errorMessages['birthDate'];
        }
      }
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
    const requeriments = /^[A-Za-z ,-]+$/

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

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }


}
