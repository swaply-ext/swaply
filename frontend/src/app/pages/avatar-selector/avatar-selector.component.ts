import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NextButtonComponent } from '../../components/next-button/next-button.component';
import { AccountService } from '../../services/account.service';
import { Router } from '@angular/router';

// Definimos una interfaz simple para los datos del avatar
interface AvatarOption {
  id: number | string;
  type: 'image' | 'upload-action';
  imageUrl?: string; // Opcional: URL si tuvieras las imágenes reales
}

@Component({
  selector: 'app-profile-selector',
  standalone: true,
  imports: [CommonModule, NextButtonComponent],
  templateUrl: './avatar-selector.component.html',
  styleUrl: './avatar-selector.component.css',
})
export class AvatarSelectorComponent {
  profilePhotoUrl: string | null = null;
  isUploadingPhoto = false;
  isReadingPhoto = false;
  errorMessages: { [key: string]: string } = {};
  selectedFile: File | null = null;

  // Signal para rastrear el ID del avatar seleccionado actualmente.
  // Inicializamos con el ID 1 (como en la segunda imagen de referencia).
  selectedAvatarId = signal<number | string>(1);

  // Datos simulados para los 8 avatares + el botón de subir
  avatars: AvatarOption[] = [
    { id: 1, type: 'image', imageUrl: 'https://swaplystorage.blob.core.windows.net/default-img/avatar-default.webp' }, // Gris claro (simula el icono por defecto)
    { id: 3, type: 'image', imageUrl: 'https://swaplystorage.blob.core.windows.net/default-img/avatar-img1.webp' },
    { id: 4, type: 'image', imageUrl: 'https://swaplystorage.blob.core.windows.net/default-img/avatar-img2.webp' },
    { id: 5, type: 'image', imageUrl: 'https://swaplystorage.blob.core.windows.net/default-img/avatar-img3.webp' },
    { id: 6, type: 'image', imageUrl: 'https://swaplystorage.blob.core.windows.net/default-img/avatar-img4.webp' },
    { id: 2, type: 'image', imageUrl: 'https://swaplystorage.blob.core.windows.net/default-img/avatar-img5.webp' },
    { id: 7, type: 'image', imageUrl: 'https://swaplystorage.blob.core.windows.net/default-img/avatar-img6.webp' },
    { id: 8, type: 'image', imageUrl: 'https://swaplystorage.blob.core.windows.net/default-img/avatar-img7.webp' }, // Repetir una imagen para completar
    // El último elemento es la acción de "subir propia"
    { id: 'upload', type: 'upload-action' },
  ];

  constructor(private accountService: AccountService, private router: Router) { }

  // Método para actualizar la selección
  selectAvatar(id: number | string): void {
    this.selectedAvatarId.set(id);
    if (id !== 'upload') {
      this.selectedFile = null;
      this.profilePhotoUrl = null;
    }
  }

  onContinue(): void {
    const selectedId = this.selectedAvatarId();
    if (selectedId === 'upload' && this.selectedFile) {
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
        //If no avatar is selected, just navigate to home
        this.router.navigate(['/home']);
      }
    } else {
      console.log('Continuando con avatar ID:', selectedId);
      // Maybe show a message to select a photo
    }
  }

  onPhotoSelected(event: any): void {
    const file = event.target.files[0];

    // Resetear error previo
    delete this.errorMessages['profilePhoto'];

    if (file) {
      this.isReadingPhoto = true;
      // validación del formato
      const validExtensions = ['jpeg', 'jpg', 'png', 'webp', 'heic', 'heif'];
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (!fileExtension || !validExtensions.includes(fileExtension)) {
        this.errorMessages['profilePhoto'] =
          'Solo se permiten imágenes JPG, PNG, WEBP, HEIC o HEIF.';
        this.isReadingPhoto = false;
        return;
      }
      // Validación de tamaño (2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.errorMessages['profilePhoto'] =
          'La imagen es demasiado grande. Máximo 2MB.';
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