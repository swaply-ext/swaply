import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AlertService } from '../services/alert.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem("authToken");
  const alertService = inject(AlertService); 

  let newReq = req;
  if (token) {
    newReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(newReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/login')) {
        alertService.show('error', 'auth'); 
      } else if (error.status >= 500) {
        alertService.show('error', 'server'); 
      }
      
      return throwError(() => error);
    })
  );
};