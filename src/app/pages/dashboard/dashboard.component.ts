import { Component, EventEmitter, output } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NgIf } from '@angular/common';
import { RoleManagementComponent } from '../role-management/role-management.component';
import { NavBarComponent } from '../../shared/nav-bar/nav-bar.component';
import { StudentRegistrationComponent } from '../student-registration/student-registration.component';
import { StudentListComponent } from '../student-list/student-list.component';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { TestCreationComponent } from '../test-creation/test-creation.component';
import { TestListComponent } from '../test-list/test-list.component';
import { CreateParentComponent } from '../create-parent/create-parent.component';
import { BreadcrumbsComponent } from '../../shared/breadcrumbs/breadcrumbs.component';
import { TeacherDashboardComponent } from '../teacher-dashboard/teacher-dashboard.component';

@Component({
  selector: 'app-dashboard',
  imports: [NgIf, SidebarComponent, 
    RoleManagementComponent, StudentRegistrationComponent, 
    StudentListComponent, TestCreationComponent, 
    TestListComponent, CreateParentComponent, BreadcrumbsComponent,TeacherDashboardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  userRole: string | null = null;
  loading = true;
  selectedSection = 'dashboard';
  sectionSelected = new EventEmitter<string>();
  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.auth.getCurrentUserWithRole().subscribe(user => {
      if (user) this.userRole = user.role;
      this.loading = false;
      
    });
  }

  onSectionSelected(section: string) {
    this.selectedSection = section;
    console.log(section)
  }
    
}