import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { TeacherDashboardComponent } from '../teacher-dashboard/teacher-dashboard.component';
import { StudentListComponent } from '../student-list/student-list.component';
import { StudentRegistrationComponent } from '../student-registration/student-registration.component';
import { TestListComponent } from '../test-list/test-list.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: '',
        component: TeacherDashboardComponent,
        children: [
          { path: 'students', component: StudentListComponent },
          { path: 'students/register', component: StudentRegistrationComponent },
          { path: 'tests', component: TestListComponent },
          { path: '', redirectTo: 'students', pathMatch: 'full' }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}