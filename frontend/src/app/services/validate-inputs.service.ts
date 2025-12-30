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
    const maxLength = 50;
    const requirements = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñçÇïÏ0-9\s,'ºª-]+$/;
    return location.length >= minLength && location.length <= maxLength && requirements.test(location);
  }
}
