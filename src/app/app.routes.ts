import { Routes } from '@angular/router';
import { LandingPageComponent } from '@presentation/pages/landing-page/landing-page.component';
import { AuthComponent } from '@presentation/pages/auth/auth.component';
import { SignInComponent } from '@presentation/pages/auth/sign-in/sign-in.component';
import { SignUpComponent } from '@presentation/pages/auth/sign-up/sign-up.component';
import { DashboardComponent } from './presentation/pages/dashboard/dashboard.component';
import { AsistenciasComponent } from './presentation/pages/asistencias/asistencias.component';
import { DashboardMessageComponent } from '@components/dashboard-message/dashboard-message.component';
import { HorariosComponent } from '@presentation/pages/horarios/horarios.component';
import { HorariosgeneralComponent } from '@presentation/pages/horariosgeneral/horariosgeneral.component';

export const routes: Routes = [

  // Página de inicio
  {
    path: "", component: LandingPageComponent, title: "EduTrack - Rastreador de asistencias"
  },

  // Control de inicio de sesión y registro de usuarios
  {
    path: "auth", component: AuthComponent, title: "EduTrack - Inicio de sesión",
    children: [
      {
        path: "sign-in", component: SignInComponent
      },
      {
        path: "sign-up", component: SignUpComponent, title: "EduTrack - Registarse"
      }
    ],
  },

  {
    path: 'dashboard', component: DashboardComponent,
    children: [
      {
        path: '', component: DashboardMessageComponent
      },
      {
        path: 'asistencias', component: AsistenciasComponent
      },
      {
        path: 'horarios', component: HorariosComponent
      }
    ]
  },
  {
    path: 'horariosgeneral', component: HorariosgeneralComponent
  },
  


];
