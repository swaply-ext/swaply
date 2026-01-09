import { Injectable, signal } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AccountService } from '../services/account.service';
import { ProfileDataDTO } from '../models/data.models';

@Injectable({
  providedIn: 'root'
})

//Le indicamos el tipo de dato que debe de devolver, en este caso es un ProfileDataDTO
export class getProfileDataResolver implements Resolve<ProfileDataDTO> { 
  //Importamos el servicio que se necesite
  constructor(private accountService: AccountService) {} 

  //Debe devolver un objeto Observable del tipo ProfileDataDTO
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ProfileDataDTO> { 
    return this.accountService.getProfileData().pipe(
      catchError(error => {
        console.error('Error obteniendo el profile data', error);
        // Devuelve un Observable con un objeto ProfileDataDTO con campos vacíos para que la app no pete
        const defaultProfileData: ProfileDataDTO = {
            name: '',
            surname : '' ,
            username: '',
            location: {placeId: '', lat: 0, lon: 0, displayName: ''},
            description: '',
            interests: [] ,
            skills: [] ,
            profilePhotoUrl: ''
        };
        
        return of(defaultProfileData);
      })
    );
  }
}
