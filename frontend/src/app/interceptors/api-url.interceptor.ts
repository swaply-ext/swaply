import { HttpInterceptorFn } from '@angular/common/http';

export const baseApiUrl = "http://localhost:8081/api"

export const apiUrlInterceptor: HttpInterceptorFn = (req, next) => {

  // Si contiene el string http/https no modificamos la peticion
  if (req.url.includes('http') || req.url.includes('https')) {
    return next(req);
  }

  // En caso contrario añadir la url al inicio
  const reqCloned = req.clone({
    url: `${baseApiUrl}${req.url}`
  });

  return next(reqCloned);
};
