/*import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Routes } from '@angular/router';
import { SkillsComponent } from './skills/skills.component';
import { InterestsComponent } from './interests/interests.component';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(Routes)]
};*/
import { Routes } from '@angular/router';
import { SkillsComponent } from './pages/skills/skills.component';
import { InterestsComponent } from './pages/interests/interests.component';

export const appRoutes: Routes = [
  { path: 'skills', component: SkillsComponent },
  { path: 'interests', component: InterestsComponent },
  { path: '', redirectTo: '/skills', pathMatch: 'full' } // ruta per defecte
];

