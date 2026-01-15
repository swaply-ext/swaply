import { Injectable } from '@angular/core';
import { RecoveryData } from '../models/data.models';


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