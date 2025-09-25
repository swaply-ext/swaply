import { Routes } from '@angular/router';
import { SkillsComponent } from './pages/skills/skills.component';
import { InterestsComponent } from './pages/interests/interests.component';
import { HomeComponent } from './pages/home/home.component';
import { RegisterFormComponent } from './pages/register-form/register-form.component';
import { LoginFormComponent } from './pages/login-form/login-form.component';
import { RecoveryPasswordComponent } from './pages/recovery-password/recovery-password.component';
import { EmailVerificationComponent } from './pages/email-verification/email-verification.component';
import { NewPasswordComponent } from './pages/new-password/new-password.component'; // <-- añadimos aquí

// Creamos una ruta para la verificación de correo
// Ahora usamos el componente real EmailVerificationComponent
export const appRoutes: Routes = [
  { path: 'skills', component: SkillsComponent }, // ruta para ver SkillsComponent
  { path: 'interests', component: InterestsComponent }, // ruta para ver InterestsComponent
  { path: '', component: HomeComponent }, // ruta principal muestra el componente Home
  { path: 'register', component: RegisterFormComponent }, // ruta para el formulario de registro
  { path: 'verify', component: EmailVerificationComponent }, // ruta para la verificación de correo
  { path: 'login', component: LoginFormComponent }, // ruta para el login
  { path: 'recovery-password', component: RecoveryPasswordComponent }, // ruta para la recuperación de contraseña
  { path: 'new-password', component: NewPasswordComponent } // <-- nueva ruta para cambiar contraseña
];
