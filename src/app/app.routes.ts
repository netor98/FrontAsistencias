import { Routes } from '@angular/router';
import { LandingPageComponent } from '@presentation/pages/landing-page/landing-page.component';
import { AuthComponent } from '@presentation/pages/auth/auth.component';
import { SignInComponent } from '@presentation/pages/auth/sign-in/sign-in.component';
import { SignUpComponent } from '@presentation/pages/auth/sign-up/sign-up.component';
import { DashboardMessageComponent } from '@components/dashboard-message/dashboard-message.component';
import { HorariosgeneralComponent } from '@presentation/pages/horariosgeneral/horariosgeneral.component';

import { DashboardJefeComponent } from '@presentation/pages/dashboard-jefe/dashboard-jefe.component';
import { JefeHomeComponent } from '@presentation/pages/dashboard-jefe/components/jefe-home/jefe-home.component';
import { JefeHorariosComponent } from '@presentation/pages/dashboard-jefe/components/jefe-horarios/jefe-horarios.component';

import { DashboardChecadorComponent } from '@presentation/pages/dashboard-checador/dashboard-checador.component';
import { ChecadorHomeComponent } from '@presentation/pages/dashboard-checador/components/checador-home/checador-home.component';
import { ChecadorHorariosComponent } from '@presentation/pages/dashboard-checador/components/checador-horarios/checador-horarios.component'

import { DashboardMaestroComponent } from '@presentation/pages/dashboard-maestro/dashboard-maestro.component';
import { MaestroHomeComponent } from '@presentation/pages/dashboard-maestro/components/maestro-home/maestro-home.component';
import { MaestroHorariosComponent } from '@presentation/pages/dashboard-maestro/components/maestro-horarios/maestro-horarios.component';

import { AsistenciasComponent } from '@presentation/pages/admin/asistencias/asistencias.component';
import { DashboardComponent } from './presentation/pages/dashboard/dashboard.component';
import { AdminDashboardComponent } from '@presentation/pages/admin/dashboard/dashboard.component';
import { CarrerasComponent } from '@presentation/pages/admin/carreras/carreras.component';
import { MateriasComponent } from '@presentation/pages/admin/materias/materias.component';
import { UsersComponent } from '@presentation/pages/admin/users/users.component';
import { GruposComponent } from '@presentation/pages/admin/grupos/grupos.component';
import { FacultadesComponent } from '@presentation/pages/admin/facultades/facultades.component';
import { EdificiosComponent } from '@presentation/pages/admin/edificios/edificios.component';
import { AulasComponent } from '@presentation/pages/admin/aulas/aulas.component';
import { HorariosComponent } from '@presentation/pages/admin/horarios/horarios.component';
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
    path: 'horariosgeneral', component: HorariosgeneralComponent
  },

  // {
  //   path: 'dashboard', component: DashboardComponent,
  //   children: [
  //     {
  //       path: '', component: DashboardMessageComponent
  //     },
  //     {
  //       path: 'asistencias', component: AsistenciasComponent
  //     },
  //     {
  //       path: 'horarios', component: HorariosComponent
  //     }
  //   ]
  // },

  {
    path: 'dashboard-jefe', component: DashboardJefeComponent,
    children:
      [
        {
          path: '', component: JefeHomeComponent
        },
        {
          path: 'jefe-horarios', component: JefeHorariosComponent
        },

      ]
  },

  {
    path: 'dashboard-checador', component: DashboardChecadorComponent,
    children:
      [
        {
          path: '', component: ChecadorHomeComponent
        },
       {
          path: 'checador-horarios', component: ChecadorHorariosComponent
       }
      ]
  },

  {
    path: 'dashboard-maestro', component: DashboardMaestroComponent,
    children:
      [
        {
          path: '', component: MaestroHomeComponent

        },
        {
          path: 'maestro-horarios', component: MaestroHorariosComponent
        }
        
      ]
  },

  {
    path: 'admin',
    component: AdminDashboardComponent,
    children: [
      {
        path: '', redirectTo: 'dashboard', pathMatch: 'full'
      },
      {
        path: 'dashboard', component: AdminDashboardComponent
      },
      {
        path: 'carreras', component: CarrerasComponent
      },
      {
        path: 'materias', component: MateriasComponent
      },
      {
        path: 'usuarios', component: UsersComponent
      },
      {
        path: 'asistencias', component: AsistenciasComponent
      },
      {
        path: 'grupos', component: GruposComponent
      },
      {
        path: 'facultades', component: FacultadesComponent
      },
      {
        path: 'edificios', component: EdificiosComponent
      },
      {
        path: 'aulas', component: AulasComponent
      },
      {
        path: 'horarios', component: HorariosComponent
      }
    ]
  }

  //   // Control de inicio de sesión y registro de usuarios
  //   {
  //     path: "auth", component: AuthComponent, title: "EduTrack - Inicio de sesión",
  //     children: [
  //       {
  //         path: "sign-in", component: SignInComponent
  //       },
  //       {
  //         path: "sign-up", component: SignUpComponent, title: "EduTrack - Registarse"
  //       }
  //     ],
  //   },
  //
  //   {
  //     path: 'dashboard', component: DashboardComponent
  //   },
  //
  //   {
  //     path: 'asistencias', component: AsistenciasComponent
  //   }
]
