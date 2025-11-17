import { inject, Inject } from '@angular/core';
import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { LoadingService } from '../services/loading.service';
import { finalize } from 'rxjs';


export const SKIP_LOADING = new HttpContextToken<boolean>(() => false);

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {

  if(req.context.get(SKIP_LOADING) === true){
    return next(req);
  }

  const loadingService = inject(LoadingService);

  loadingService.show();

  return next(req).pipe(
    finalize(() => {
      loadingService.hide();
    })
  );
};
