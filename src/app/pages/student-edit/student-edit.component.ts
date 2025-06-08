import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Database, ref, get, update } from '@angular/fire/database';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-student-edit',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './student-edit.component.html',
  styleUrl: './student-edit.component.css'
})
export class StudentEditComponent implements OnInit {
  studentForm!: FormGroup;
  studentId: string | null = null;
  loading = true;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private db: Database
  ) {}

  ngOnInit(): void {
    this.studentId = this.route.snapshot.paramMap.get('id');
    this.studentForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      birthday: ['', Validators.required],
      schoolGrade: ['', Validators.required],
      gender: ['', Validators.required],
      mathGrade: ['']
    });

    if (this.studentId) {
      get(ref(this.db, `users/${this.studentId}`)).then(snapshot => {
        if (snapshot.exists()) {
          const student = snapshot.val();
          this.studentForm.patchValue({
            firstName: student.firstName || '',
            lastName: student.lastName || '',
            birthday: student.birthday || '',
            schoolGrade: student.schoolGrade || '',
            gender: student.gender || '',
            mathGrade: student.mathGrade || ''
          });
        }
        this.loading = false;
      });
    } else {
      this.loading = false;
    }
  }

  onSubmit() {
    if (this.studentForm.invalid || !this.studentId) return;
    update(ref(this.db, `users/${this.studentId}`), this.studentForm.value)
      .then(() => {
        this.successMessage = 'Student information updated successfully!';
        setTimeout(() => {
          this.router.navigate(['/dashboard/students', this.studentId]);
        }, 1200);
      })
      .catch(error => {
        this.errorMessage = 'Failed to update student information.';
        console.error(error);
      });
  }
}
