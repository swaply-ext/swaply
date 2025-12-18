import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AccountService } from '../services/account.service';
import { ProfileDataDTO } from '../models/profile-data-dto.model';

@Injectable({
  providedIn: 'root'
})
export class PrivateProfileResolver implements Resolve<ProfileDataDTO> { //Le indicamos el tipo de dato que debe de devovler
  constructor(private accountService: AccountService) {} //Importamos el servicio que se necesite

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ProfileDataDTO> { //EL tipo de dato debe de ser el mismo
    return this.accountService.getProfileData();
  }
}
