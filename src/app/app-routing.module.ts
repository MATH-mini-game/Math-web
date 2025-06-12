import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [AuthGuard], 
    data: { breadcrumb: 'Dashboard' },
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/dashboard-home/dashboard-home.component').then(m => m.DashboardHomeComponent),
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Home' }
      },
      {
        path: 'students',
        data: { breadcrumb: 'Students' },
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/student-list/student-list.component').then(m => m.StudentListComponent),
            canActivate: [AuthGuard]
          },
          {
            path: 'register',
            loadComponent: () => import('./pages/student-registration/student-registration.component').then(m => m.StudentRegistrationComponent),
            canActivate: [AuthGuard],
            data: { breadcrumb: 'Register Student' }
          },
          {
            path: ':id',
            loadComponent: () => import('./pages/student-details/student-details.component').then(m => m.StudentDetailsComponent),
            canActivate: [AuthGuard],
            data: { breadcrumb: 'Student Details' }
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./pages/student-edit/student-edit.component').then(m => m.StudentEditComponent),
            canActivate: [AuthGuard],
            data: { breadcrumb: 'Edit Student' }
          }
        ]
      },
      {
        path: 'tests',
        data: { breadcrumb: 'Tests' },
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/test-list/test-list.component').then(m => m.TestListComponent),
            canActivate: [AuthGuard]
          },
          {
            path: 'create',
            loadComponent: () => import('./pages/test-creation/test-creation.component').then(m => m.TestCreationComponent),
            canActivate: [AuthGuard],
            data: { breadcrumb: 'Create Test' }
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./pages/test-edit/test-edit.component').then(m => m.TestEditComponent),
            canActivate: [AuthGuard],
            data: { breadcrumb: 'Edit Test' }
          },
          {
            path: ':id',
            loadComponent: () => import('./pages/test-details/test-details.component').then(m => m.TestDetailsComponent),
            canActivate: [AuthGuard],
            data: { breadcrumb: 'Test Details' }
          }
        ]
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent),
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Settings' }
      },
    ]
  },
  { 
    path: 'register', 
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent),
    data: { breadcrumb: 'Register' }
  },
  { 
    path: 'login', 
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    data: { breadcrumb: 'Login' }
  },
  { 
    path: 'pending-approval', 
    loadComponent: () => import('./pages/pending-approval/pending-approval.component').then(m => m.PendingApprovalComponent),
    data: { breadcrumb: 'Pending Approval' }
  },
  { path: '**', redirectTo: 'register' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
