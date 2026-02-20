import { LocationSearchComponent } from './components/location-search/location-search.component';
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SkillsComponent } from './pages/skills/skills.component';
import { InterestsComponent } from './pages/interests/interests.component';
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
import { LoadingScreenComponent } from './components/loading-screen/loading-screen.component';
import { InterestsPanelComponent } from './components/interests-panel/interests-panel.component';
import { ProfileInfoComponent } from './components/profile-info/profile-info.component';
import { EditProfileComponent } from './pages/edit-profile/edit-profile.component';
import { PublicProfileComponent } from './pages/public-profile/public-profile.component';
import { RecoveryEmailComponent } from './pages/recovery-email/recovery-email.component';
import { PassVerificationComponent } from './pages/pass-verification/pass-verification.component';
import { SideMenuComponent } from './components/side-menu/side-menu.component';
import { ExitComponent } from './pages/exit/exit.component';
import { Error404Component } from './pages/error-404/error-404.component';
import { PrivateProfileComponent } from './pages/private-profile/private-profile.component';
import { SkillSearchComponent } from './components/skill-search/skill-search.component';
import { AuthGuard } from './services/auth-guard.service';
import { LinkSentConfirmationComponent } from './pages/link-sent-confirmation/link-sent-confirmation.component';
import { CodeSentConfirmationComponent } from './pages/code-sent-confirmation/code-sent-confirmation.component';
import { FilterSkillsComponent } from './components/filter-skills/filter-skills.component';
import { PrivacyAndSecurityComponent } from './pages/privacy-and-security/privacy-and-security.component';
import { EmailSentComponent } from './pages/email-sent/email-sent.component';
import { MySwapsPageComponent } from './pages/my-swaps/my-swaps.component';
import { SwapRequestsComponent } from './pages/swap-requests/swap-requests.component';
import { SwapComponent } from './pages/swap/swap.component';
import { SwapSkillsComponent } from './components/swap-skills/swap-skills.component';
import { SwapInterestsComponent } from './components/swap-interests/swap-interests.component';
import { DeleteAccountConfirmationComponent } from './pages/delete-account-confirmation/delete-account-confirmation.component';
import { UserSearchComponent } from './components/user-search/user-search.component';
import { TermsConditionsComponent } from './pages/terms-conditions/terms-conditions.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { ComingSoonComponent } from './pages/coming-soon/coming-soon.component';
import { getProfileDataResolver } from './resolver/get-profile-data.service';
import { AvatarSelectorComponent } from './pages/avatar-selector/avatar-selector.component';
import { LandingComponent } from './landing/landing.component';

// Creamos una ruta para la verificación de correo
// Ahora usamos el componente real EmailVerificationComponent
export const appRoutes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard], resolve: { profileData: getProfileDataResolver }}, // ruta principal muestra el componente Home
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard], resolve: { profileData: getProfileDataResolver } }, // ruta para ver HomeComponent
  { path: 'skills', component: SkillsComponent, canActivate: [AuthGuard] }, // ruta para ver SkillsComponent
  { path: 'interests', component: InterestsComponent, canActivate: [AuthGuard],}, // ruta para ver InterestsComponent
  { path: 'register', component: RegisterFormComponent }, // ruta para el formulario de registro
  { path: 'code-sent-confirmation', component: CodeSentConfirmationComponent },
  { path: 'verify', component: EmailVerificationComponent }, // ruta para la verificación de correo
  { path: 'login', component: LoginFormComponent }, // ruta para el login
  { path: 'recovery-password', component: RecoveryPasswordComponent }, // ruta para la recuperación de contraseña
  { path: 'link-sent-confirmation', component: LinkSentConfirmationComponent },
  { path: 'new-password', component: NewPasswordComponent }, // nueva ruta para cambiar contraseña
  { path: 'personal-information', component: PersonalInformationComponent }, // ruta para información personal
  { path: 'confirmation', component: ConfirmationComponent }, // ruta para pantalla de confirmación antes de Home
  { path: 'confirm-password', component: ConfirmPasswordComponent }, // ruta para pantalla de confirmación de cambio de contraseña
  { path: 'error-auth', component: ErrorAuthComponent }, // ruta para pantalla de error de autenticación
  { path: 'navbar', component: AppNavbarComponent }, // ruta para el menú de navegación (temporal)
  { path: 'skills-panel', component: SkillsPanelComponent }, // ruta para el panel de habilidades
  { path: 'loading', component: LoadingScreenComponent }, // ruta para la pantalla de carga
  { path: 'interests-panel', component: InterestsPanelComponent }, // ruta para el panel de intereses
  { path: 'profile-info', component: ProfileInfoComponent, canActivate: [AuthGuard] }, // ruta para la información personal (temporal)
  { path: 'profile-edit', component: EditProfileComponent , canActivate: [AuthGuard] }, // ruta para el perfil de usuario
  { path: 'user/:username', loadComponent: () => import('./pages/public-profile/public-profile.component').then(m => m.PublicProfileComponent)}, //enlace a el perfil publico pero indicando el username del cual
  { path: 'recovery-email', component: RecoveryEmailComponent },
  { path: 'pass-verification', component: PassVerificationComponent },
  { path: 'side-menu', component: SideMenuComponent }, // ruta para el componente del menú lateral
  { path: 'exit', component: ExitComponent },
  { path: 'myprofile', component: PrivateProfileComponent, canActivate: [AuthGuard], resolve: { profileData: getProfileDataResolver }}, //resolve:{nombre_del_objeto: tipo_del_objeto}. Esto le pasa al .ts un objeto llamado nombre_del_objeto del tipo indicado.
  { path: 'search-skills', component: SkillSearchComponent }, //barra de busqueda componente
  { path: 'filter-skills', component: FilterSkillsComponent },
  { path: 'location-search', component: LocationSearchComponent },
  { path: 'swap-skills', component: SwapSkillsComponent },
  { path: 'notifications', component: SwapRequestsComponent, canActivate: [AuthGuard]},
  { path: 'swap-interests', component: SwapInterestsComponent },
  { path: 'delete-account-confirmation', component: DeleteAccountConfirmationComponent },
  { path: '404', component: Error404Component },
  { path: 'my-swaps', component: MySwapsPageComponent, canActivate: [AuthGuard]},
  { path: 'privacy-and-security', component: PrivacyAndSecurityComponent, canActivate: [AuthGuard] },
  { path: 'user-search', component: UserSearchComponent },
  { path: 'coming-soon', component: ComingSoonComponent, canActivate: [AuthGuard] },
  { path: 'terms-conditions', component: TermsConditionsComponent, canActivate: [AuthGuard] },
  { path: 'privacy-policy', component: PrivacyPolicyComponent, canActivate: [AuthGuard] },
  { path: 'chat', loadComponent: () => import('./pages/chat/chat.component').then(m => m.ChatComponent), canActivate: [AuthGuard] },
  { path: 'swap/:username', component: SwapComponent, canActivate: [AuthGuard] },
  { path: 'landing', component: LandingComponent },
  { path: 'select-avatar', component: AvatarSelectorComponent, canActivate: [AuthGuard]},
  { path: '**', redirectTo: '/404', pathMatch: 'full' }
];