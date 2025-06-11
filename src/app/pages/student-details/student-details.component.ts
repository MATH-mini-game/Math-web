import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Database, ref, get, update } from '@angular/fire/database';
import { DatePipe, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-student-details',
  templateUrl: './student-details.component.html',
  styleUrls: ['./student-details.component.css'],
  standalone: true,
  imports: [RouterLink, DatePipe, NgIf, NgFor]
})
export class StudentDetailsComponent implements OnInit {
  student: any = null;
  loading = true;
  studentId: string | null = null;
  assignedTests: any[] = [];
  testResults: any = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private db: Database
  ) {}

  ngOnInit(): void {
    this.studentId = this.route.snapshot.paramMap.get('id');
    if (this.studentId) {
      get(ref(this.db, `users/${this.studentId}`)).then(snapshot => {
        if (snapshot.exists()) {
          this.student = snapshot.val();
          this.testResults = this.student.testResults || {};
          // Fetch assigned tests by grade
          if (this.student?.schoolGrade) {
            get(ref(this.db, `tests`)).then(testsSnap => {
              if (testsSnap.exists()) {
                const allTests = Object.values(testsSnap.val());
                this.assignedTests = allTests.filter((test: any) =>
                  test.grade == this.student.schoolGrade
                );
              }
            });
          }
        }
        this.loading = false;
      });
    } else {
      this.loading = false;
    }
  }

  getTestScore(testId: string): string {
    const result = this.testResults[testId];
    if (!result || !result.miniGames) return 'Pending';
    let sum = 0;
    let found = false;
    for (const mg of Object.values(result.miniGames)) {
      if (mg && typeof mg === 'object' && 'score' in mg) {
        sum += (mg as any).score || 0;
        found = true;
      }
    }
    return found ? sum.toString() : 'Pending';
  }

  editStudent() {
    // Navigate to an edit page or open a modal (implement as needed)
    this.router.navigate(['edit'], { relativeTo: this.route });
  }

  unlinkStudent() {
    if (!this.studentId) return;
    update(ref(this.db, `users/${this.studentId}`), { linkedTeacherId: null })
      .then(() => {
        // Optionally, navigate back to the student list or show a message
        this.router.navigate(['/dashboard/students']);
      })
      .catch(error => {
        // Handle error (show a message, etc.)
        console.error('Error unlinking student:', error);
      });
  }
}
