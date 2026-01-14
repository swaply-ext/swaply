/*import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Routes } from '@angular/router';
import { SkillsComponent } from './skills/skills.component';
import { InterestsComponent } from './interests/interests.component';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(Routes)]
};*/
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { appRoutes } from './app.routes';
import { importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { authInterceptor } from './interceptors/auth.interceptor';
import { loadingInterceptor } from './interceptors/loading.interceptor';
import { apiUrlInterceptor } from './interceptors/api-url.interceptor'

export const appConfig = {
  providers: [
    importProvidersFrom(FormsModule),
    provideRouter(appRoutes, withInMemoryScrolling({       
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled' 
      })),
    provideHttpClient(withInterceptors([authInterceptor, loadingInterceptor, apiUrlInterceptor])),
  ]
};

