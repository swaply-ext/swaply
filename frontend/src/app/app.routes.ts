import { Routes } from '@angular/router';
import { SkillsComponent } from './pages/skills/skills.component';
import { InterestsComponent } from './pages/interests/interests.component';
import { HomeComponent } from './pages/home/home.component';
import { RegisterFormComponent } from './pages/register-form/register-form.component';
import {LoginFormComponent } from './pages/login-form/login-form.component';

// Creem una ruta per a la verificació de correu
// Com no tenim el component real, utilitzarem un component temporal
export const appRoutes: Routes = [
  { path: 'skills', component: SkillsComponent }, // ruta per veure SkillsComponent
  { path: 'interests', component: InterestsComponent }, // ruta per veure InterestsComponent
  { path: '', component: HomeComponent }, // ruta principal muestra el componente Home
  { path: 'register', component: RegisterFormComponent }, // ruta per al formulari de registre
  { path: 'verify', component: RegisterFormComponent }, // ruta per a la verificació de correu (temporalment usem RegisterFormComponent)
  { path: 'login', component: LoginFormComponent }, // ruta per a la verificació de correu (temporalment usem RegisterFormComponent)
];

