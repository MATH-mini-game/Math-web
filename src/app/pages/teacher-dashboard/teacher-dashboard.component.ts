import { Component, Input } from '@angular/core';
import { StudentListComponent } from '../student-list/student-list.component';
import { NgIf } from '@angular/common';
import { StudentRegistrationComponent } from '../student-registration/student-registration.component';
import test from 'node:test';
import { TestListComponent } from '../test-list/test-list.component';

@Component({
  selector: 'app-teacher-dashboard',
  templateUrl: './teacher-dashboard.component.html',
  imports: [StudentListComponent,NgIf,StudentRegistrationComponent,TestListComponent],
  styleUrl: './teacher-dashboard.component.css'
})
export class TeacherDashboardComponent {
  @Input() selectedSection: string = 'dashboard'; // Default section


  // Handle navigation within teacher dashboard
  onNavigate(section: string) {
    this.selectedSection = section;
  }
  
}
