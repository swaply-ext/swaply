import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RegisterDataService {
  private registerData: any = {};

  setRegisterData(data: any) {
    this.registerData = { ...this.registerData, ...data };
  }

  getRegisterData() {
    return this.registerData;
  }

  clearData() {
    this.registerData = {};
  }
}