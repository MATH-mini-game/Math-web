import { Component, EventEmitter, Input, Output, output } from '@angular/core';
import { StudentListComponent } from '../student-list/student-list.component';
import { NgIf } from '@angular/common';
import { StudentRegistrationComponent } from '../student-registration/student-registration.component';
import { TestListComponent } from '../test-list/test-list.component';

@Component({
  selector: 'app-teacher-dashboard',
  templateUrl: './teacher-dashboard.component.html',
  imports: [StudentListComponent,NgIf,StudentRegistrationComponent,TestListComponent],
  styleUrl: './teacher-dashboard.component.css'
})
export class TeacherDashboardComponent {
  @Input() selectedSection: string = 'dashboard'; 

  
  onSectionSelected(section: string) {
    this.selectedSection = section;
  }
  
}
