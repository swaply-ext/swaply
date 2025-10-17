import { Injectable } from '@angular/core';
export interface RecoveryData {
  id?: string;
  code?: string;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecoveryDataService {
  private data: RecoveryData = {};

  setRecoveryData(d: RecoveryData) {
    this.data = { ...this.data, ...d };
  }

  getRecoveryData(): RecoveryData {
    return this.data;
  }

  clear() {
    this.data = {};
  }
}