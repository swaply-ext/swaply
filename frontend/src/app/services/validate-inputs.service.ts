import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidateInputsService {

  constructor() { }
  /*
   * Ayuda para entender los re (Requirements)
   * /^ -> Así se abre un re
   * $/ -> Así se cierra un re
   * []: Define un conjunto de caracteres. Por ejemplo:
         [A-Z]    coincide con cualquier letra mayúscula.
         [0-9]    coincide con cualquier dígito.
         [a-zA-Z] coincide con cualquier letra mayúscula o minúscula.
   *(?=.*[]): Lookahead positivo. Asegura que hay al menos un caracter que cumpla con esa condición. Por ejemplo:
         (?=.*[A-Z])            exige que haya una letra mayúscula en la cadena.
         (?=.*[a-z])            exige que haya una letra minúscula en la cadena.
         (?=.*[A-Z])(?=.*[a-z]) exige que haya una letra mayúscula y una minúscula en la cadena.
   */

  public isNameValid(name: string): boolean {
    const minLength = 3;
    const maxLength = 30;
    const requirements = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]+$/;
    return name.length >= minLength && name.length <= maxLength && requirements.test(name);
  }

  public isSurnameValid(surname: string): boolean {
    const minLength = 3;
    const maxLength = 30;
    const requirements = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]+$/;
    return surname.length >= minLength && surname.length <= maxLength && requirements.test(surname);
  }

  public isUsernameValid(username: string): boolean {
    const minLength = 3;
    const maxLength = 30;
    const requirements = /^[a-z0-9_-]+$/;
    return username.length >= minLength && username.length <= maxLength && requirements.test(username);
  }

  /* TODO: Cuando se haga el refactor y se centralicen los mensajes de error debemos cambiar esto
   *       para que dependiendo del requisito que le falte a la contrasña te devuelva el error
   *       de ese requisito que no cumple. Ahora mismo le devuelve todo.
   */
  public isPasswordValid(password: string): boolean {
    const minLength = 8;
    const maxLength = 64;
    //Cuando centralicemos lso mensajes de rror esto lo podremso dividir en diferentes requirements para
    //enviar mensajes de eror acorde a lo que le falte a la password
    const requirements = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*?]).+$/;
    const simpleSeq = /(1234|abcd|password|qwerty)/i;
    return password.length >= minLength && password.length <= maxLength && requirements.test(password) && !simpleSeq.test(password);
  }

  public isDescriptionValid(description: string): boolean {
    const minLength = 10;
    const maxLength = 200;
    return description.length >= minLength && description.length <= maxLength;
  }

  public isEmailValid(email: string): boolean {
    const requirements = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return requirements.test(email);
  }

  public isLocationValid(location: string): boolean {
    const minLength = 3;
    const maxLength = 200;
    const requirements = /^[A-Za-zÀÈÌÒÙàèìòùÁÉÍÓÚÜÑáéíóúüñçÇïÏ0-9\s,'ºª-]+$/;
    return location.length >= minLength && location.length <= maxLength && requirements.test(location);
  }

  public isImageExtensionValid(file: File): boolean {
    if (!file) {
      return false;
    }
    const validExtensions = ['jpeg', 'jpg', 'png', 'webp', 'heic', 'heif'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    return !!fileExtension && validExtensions.includes(fileExtension);
  }

  public isImageSizeValid(file: File, maxSizeInMB: number): boolean {
    if (!file) {
      return false;
    }
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }

  public isGenderValid(gender: string): boolean {
    return !!gender;
  }

  public validateBirthDate(birthDate: string): { isValid: boolean, message: string } {
    if (!birthDate) {
      return { isValid: false, message: 'La fecha de nacimiento es obligatoria.' };
    }

    const date = new Date(birthDate);

    if (this.isFutureDate(date) || this.isToday(date)) {
      return { isValid: false, message: 'La fecha de nacimiento no es válida.' };
    }

    const age = this.calculateAge(date);
    if (age < 18 || age > 120) {
      return { isValid: false, message: 'La edad debe estar entre 18 y 120 años.' };
    }

    return { isValid: true, message: '' };
  }

  public formatLocation(displayName: string | undefined): string {
    if (!displayName) {
      return '';
    }
    const parts = displayName.split(', ');
    if (parts.length > 1) {
      return `${parts[0]}, ${parts[parts.length - 1]}`;
    }
    return displayName;
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
    today.setHours(0, 0, 0, 0);
    return date.getTime() > today.getTime();
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
