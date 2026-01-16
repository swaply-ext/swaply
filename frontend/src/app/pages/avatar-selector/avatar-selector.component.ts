import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NextButtonComponent } from '../../components/next-button/next-button.component';
import { AccountService } from '../../services/account.service';
import { Router } from '@angular/router';
import { ValidateInputsService } from '../../services/validate-inputs.service';
import { UserAvatarOption } from '../../models/user.models';

@Component({
  selector: 'app-profile-selector',
  standalone: true,
  imports: [CommonModule, NextButtonComponent],
  templateUrl: './avatar-selector.component.html',
  styleUrl: './avatar-selector.component.css',
})
export class AvatarSelectorComponent {
  profilePhotoUrl: string = '';
  isUploadingPhoto = false;
  isReadingPhoto = false;
  errorMessages: { [key: string]: string } = {};
  selectedFile: File = {} as File;

  // Signal para rastrear el ID del avatar seleccionado actualmente.
  // Inicializamos con el ID 1 (como en la segunda imagen de referencia).
  selectedAvatarId = signal<number | string>(1);
  private readonly imgBaseUrl = 'https://swaplystorage.blob.core.windows.net/default-img/avatar-';

  avatars: UserAvatarOption[] = [
    { id: 1, type: 'image', imageUrl: `${this.imgBaseUrl}default.webp` },
    { id: 3, type: 'image', imageUrl: `${this.imgBaseUrl}img1.webp` },
    { id: 4, type: 'image', imageUrl: `${this.imgBaseUrl}img2.webp` },
    { id: 5, type: 'image', imageUrl: `${this.imgBaseUrl}img3.webp` },
    { id: 6, type: 'image', imageUrl: `${this.imgBaseUrl}img4.webp` },
    { id: 2, type: 'image', imageUrl: `${this.imgBaseUrl}img5.webp` },
    { id: 7, type: 'image', imageUrl: `${this.imgBaseUrl}img6.webp` },
    { id: 8, type: 'image', imageUrl: `${this.imgBaseUrl}img7.webp` },
    { id: 'upload', type: 'upload-action' },
  ];

  constructor(
    private accountService: AccountService, 
    private router: Router,
    private validateInputsService: ValidateInputsService
  ) { }

  selectAvatar(id: number | string): void {
    this.selectedAvatarId.set(id);
    if (id !== 'upload') {
      this.selectedFile = {} as File;
      this.profilePhotoUrl = '';
    }
  }

  onContinue(): void {
    const selectedId = this.selectedAvatarId();
    if (selectedId === 'upload' && this.selectedFile instanceof File) {
      this.isUploadingPhoto = true;
      this.accountService.uploadProfilePhoto(this.selectedFile).subscribe({
        next: (url) => {
          this.accountService.updateProfileData({ profilePhotoUrl: url }).subscribe({
            next: () => {
              console.log('Foto de perfil actualizada correctamente');
              this.isUploadingPhoto = false;
              this.router.navigate(['/home']);
            },
            error: (err) => {
              console.error('Error actualizando la foto de perfil:', err);
              this.isUploadingPhoto = false;
            }
          });
        },
        error: (err) => {
          console.error('Error subiendo foto:', err);
          this.isUploadingPhoto = false;
        },
      });
    } else if (selectedId !== 'upload' && selectedId !== null) {
      const selectedAvatar = this.avatars.find(avatar => avatar.id === selectedId);
      if (selectedAvatar && selectedAvatar.imageUrl) {
        this.accountService.updateProfileData({ profilePhotoUrl: selectedAvatar.imageUrl }).subscribe({
          next: () => {
            console.log('Foto de perfil actualizada correctamente');
            this.router.navigate(['/home']);
          },
          error: (err) => {
            console.error('Error actualizando la foto de perfil:', err);
          }
        });
      } else {
        this.router.navigate(['/home']);
      }
    } else {
      console.log('Continuando con avatar ID:', selectedId);
      this.router.navigate(['/home']);
    }
  }

  onPhotoSelected(event: any): void {
    const file = event.target.files[0];

    // Resetear error previo
    delete this.errorMessages['profilePhoto'];

    if (file) {
      this.isReadingPhoto = true;

      // Validación de formato
      if (!this.validateInputsService.isImageExtensionValid(file)) {
        this.errorMessages['profilePhoto'] = 'Solo se permiten imágenes JPG, PNG, WEBP, HEIC o HEIF.';
        this.isReadingPhoto = false;
        return;
      }

      // Validación de tamaño (2MB)
      if (!this.validateInputsService.isImageSizeValid(file, 1)) {
        this.errorMessages['profilePhoto'] = 'La imagen es demasiado grande. Máximo 2MB.';
        this.isReadingPhoto = false;
        return;
      }

      this.selectedFile = file;

      // Read the file for local preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profilePhotoUrl = e.target.result;
        this.selectAvatar('upload');
        this.isReadingPhoto = false;
      };
      reader.readAsDataURL(file);
    }
  }
}