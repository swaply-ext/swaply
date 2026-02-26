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
import { LocationSearchComponent } from '../../components/location-search/location-search.component';
import { ValidateInputsService } from '../../services/validate-inputs.service';
import { UserSkills } from '../../models/user-skills.model';
import { UserLocation } from '../../models/user-location.model';
import { EditProfileData } from '../../models/edit-profile.model';
import { AlertService } from '../../services/alert.service';
import { Router } from '@angular/router';

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
    , LocationSearchComponent
  ],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {
  public interests: Array<UserSkills> = [];
  public skills: Array<UserSkills> = [];
  public profileData: EditProfileData = {} as EditProfileData;
  private locationData: UserLocation | null = null;

  isUploadingPhoto = false;

  constructor(
    private accountService: AccountService,
    private validateInputsService: ValidateInputsService,
    private alertService: AlertService,
    private router: Router
  ) { }

  // Variables individuales para enlazar con el formulario
  name = "";
  surname = "";
  username = "";
  description = "";
  birthDate: string = "";
  location = "";
  gender = "";
  email = "";
  profilePhotoUrl = 'https://swaplystorage.blob.core.windows.net/default-img/avatar-default.webp';

  // Variable única para mensajes de error personalizados por campo
  errorMessages: { [key: string]: string } = {};

  ngOnInit(): void {
    this.getProfileDataFromBackend();
  }
  // Obtener datos del perfil desde el backend
  getProfileDataFromBackend(): void {
    this.accountService.getEditProfileData().subscribe({
      next: (user: EditProfileData) => {
        console.log('Datos recibidos del backend', user);
        this.splitAndSendUser(user);
      },
      error: (err) => {
        console.error('Error al obtener datos del perfil:', err);
      }
    });
  }

  splitAndSendUser(user: EditProfileData): void {
    this.interests = user.interests;
    this.skills = user.skills;
    this.mapProfileData(user);
    console.log(this.skills);
    console.log(this.interests)
  }

  // Mapear datos del usuario a la estructura EditProfileData
  mapProfileData(user: EditProfileData): void {

    if (user.location && typeof user.location === 'object' && user.location.displayName) {
      this.locationData = user.location;
    } else {
      this.locationData = null;
    }
    this.profileData = {
      name: user.name,
      surname: user.surname,
      username: user.username,
      description: user.description,
      location: this.locationData ? this.locationData.displayName : (user.location || ''),
      birthDate: user.birthDate ? new Date(user.birthDate).toISOString().substring(0, 10) : '',
      gender: user.gender,
      email: user.email,
      profilePhotoUrl: user.profilePhotoUrl || this.profilePhotoUrl,
      interests: user.interests || [],
      skills: user.skills || []
    };

    // Asignar también a las variables individuales que usa el template
    this.name = this.profileData.name;
    this.surname = this.profileData.surname;
    this.username = this.profileData.username;
    this.description = this.profileData.description;
    this.location = this.profileData.location as string;
    this.birthDate = this.profileData.birthDate;
    this.gender = this.profileData.gender;
    this.email = this.profileData.email;
    if (this.profileData.profilePhotoUrl) {
      this.profilePhotoUrl = this.profileData.profilePhotoUrl;
    }
  }

  onPhotoSelected(event: any): void {
    const file = event.target.files[0];

    // Resetear error previo
    delete this.errorMessages['profilePhoto'];

    if (file) {
      // Validación de formato
      if (!this.validateInputsService.isImageExtensionValid(file)) {
        this.errorMessages['profilePhoto'] = 'Solo se permiten imágenes JPG, PNG, WEBP, HEIC o HEIF.';
        return;
      }
      // Validación de tamaño (2MB)
      if (!this.validateInputsService.isImageSizeValid(file, 2)) {
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

    const finalLocationValue: UserLocation | string = this.locationData || this.location;

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
    const updatedUser: EditProfileData = {
      name: this.name,
      surname: this.surname,
      username: this.username.toLowerCase(),
      description: this.description,
      birthDate: this.birthDate,
      location: finalLocationValue,
      gender: this.gender,
      email: this.email.toLowerCase(),
      profilePhotoUrl: this.profilePhotoUrl,
      interests: this.interests,
      skills: this.skills      
    };
    console.log(updatedUser)

    //llamar al servicio para actualizar los datos y sobrecribir los datos actuales
    this.accountService.updateEditProfileData(updatedUser).subscribe({
      next: (success) => {
        if (success) {
          console.log('Perfil actualizado con éxito.');
          this.alertService.show('success', 'generic', { msg: 'Tus cambios se han guardado correctamente.' });
          this.router.navigate(['/myprofile']);
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
    this.errorMessages = {};

    // Validar name
    if (!this.name.trim()) {
      this.errorMessages['name'] = 'El nombre es obligatorio.';
    } else if (!this.validateInputsService.isNameValid(this.name)) {
      this.errorMessages['name'] = 'El nombre debe tener entre 3 y 30 caracteres y solo contener letras, espacios, apóstrofes o guiones.';
    }

    // Validar surname
    if (!this.surname.trim()) {
      this.errorMessages['surname'] = 'El apellido es obligatorio.';
    } else if (!this.validateInputsService.isSurnameValid(this.surname)) {
      this.errorMessages['surname'] = 'El apellido debe tener entre 3 y 30 caracteres y solo contener letras, espacios, apóstrofes o guiones.';
    }

    // Validar username
    if (!this.username.trim()) {
      this.errorMessages['username'] = 'El nombre de usuario es obligatorio.';
    } else if (!this.validateInputsService.isUsernameValid(this.username)) {
      this.errorMessages['username'] = 'El nombre de usuario debe tener entre 3 y 30 caracteres, solo letras minúsculas, números, guiones y guiones bajos.';
    }

    // Validar email
    if (!this.email.trim()) {
      this.errorMessages['email'] = 'El correo electrónico es obligatorio.';
    } else if (!this.validateInputsService.isEmailValid(this.email)) {
      this.errorMessages['email'] = 'El formato debe ser: "ejemplo@ejemplo.com"';
    }

    // Validar location
    if (!this.location.trim()) {
        this.errorMessages['location'] = 'La ubicación es obligatoria.';
    } else if (!this.validateInputsService.isLocationValid(this.location)) {
        this.errorMessages['location'] = 'La ubicación contiene caracteres no válidos.';
    }

    // Validar gender
    if (!this.validateInputsService.isGenderValid(this.gender)) {
      this.errorMessages['gender'] = 'El género es obligatorio.';
    }

    // Validar birthDate
    const birthDateValidation = this.validateInputsService.validateBirthDate(this.birthDate);
    if (!birthDateValidation.isValid) {
      this.errorMessages['birthDate'] = birthDateValidation.message;
    }

    return Object.keys(this.errorMessages).length === 0;
  }
  private refreshPage() {
    window.location.reload();
  }

  onLocationSelected(newLocation: UserLocation | null): void {
    // 1. Guarda el objeto UserLocation completo para el envío al backend
    this.locationData = newLocation; // locationData ahora es tipo location | null

    if (newLocation) {
      // 2. Actualiza la variable `location` (el string de display)
      this.location = newLocation.displayName;
    } else {
      // Manejar la limpieza si el usuario borra la ubicación
      this.location = '';
    }
    // Llamar a validate para mostrar errores si fuera necesario
    this.validate();
  }


}
