import { Routes } from '@angular/router';
import { SkillsComponent } from './pages/skills/skills.component';
import { InterestsComponent } from './pages/interests/interests.component';
import { HomeComponent } from './pages/home/home.component';
import { RegisterFormComponent } from './pages/register-form/register-form.component';
import { LoginFormComponent } from './pages/login-form/login-form.component';
import { RecoveryPasswordComponent } from './pages/recovery-password/recovery-password.component';
import { EmailVerificationComponent } from './pages/email-verification/email-verification.component';
import { NewPasswordComponent } from './pages/new-password/new-password.component'; 
import { PersonalInformationComponent } from './pages/personal-information/personal-information.component'
import { ConfirmationComponent } from './pages/confirmation/confirmation.component'; 
import { ConfirmPasswordComponent } from './pages/confirm-password/confirm-password.component';
import { ErrorAuthComponent } from './pages/error-auth/error-auth.component'; 
import { AppNavbarComponent } from './components/app-navbar/app-navbar.component'; //menu nav no es una pagina, esta provisional
import { SkillsPanelComponent } from './components/skills-panel/skills-panel.component';
import { LoadingScreenComponent } from './pages/loading-screen/loading-screen.component';
import { InterestsPanelComponent } from './components/interests-panel/interests-panel.component';

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
  { path: 'new-password', component: NewPasswordComponent }, // nueva ruta para cambiar contraseña
  { path: 'personal-information', component: PersonalInformationComponent }, // ruta para información personal
  { path: 'confirmation', component: ConfirmationComponent }, // ruta para pantalla de confirmación antes de Home
  { path: 'confirm-password', component: ConfirmPasswordComponent }, // ruta para pantalla de confirmación de cambio de contraseña
  { path: 'error-auth', component: ErrorAuthComponent }, // ruta para pantalla de error de autenticación
  { path: 'navbar', component: AppNavbarComponent }, // ruta para el menú de navegación (temporal)
  { path: 'skills-panel', component: SkillsPanelComponent }, // ruta para el panel de habilidades
  { path: 'loading', component: LoadingScreenComponent }, // ruta para la pantalla de carga
  { path: 'interests-panel', component: InterestsPanelComponent } // ruta para el panel de habilidades
];
