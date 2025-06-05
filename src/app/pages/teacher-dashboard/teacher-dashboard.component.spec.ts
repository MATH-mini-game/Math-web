import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherDashboardComponent } from './teacher-dashboard.component';
import { StudentRegistrationComponent } from '../student-registration/student-registration.component';
import { StudentListComponent } from '../student-list/student-list.component';

describe('TeacherDashboardComponent', () => {
  let component: TeacherDashboardComponent;
  let fixture: ComponentFixture<TeacherDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherDashboardComponent,StudentListComponent, StudentRegistrationComponent],
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
