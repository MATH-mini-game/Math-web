import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Database, ref, get } from '@angular/fire/database';
import { DatePipe, KeyValuePipe, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-test-details',
  templateUrl: './test-details.component.html',
  styleUrl: './test-details.component.css',
  standalone: true,
  imports: [NgIf,NgFor,RouterLink,TitleCasePipe,KeyValuePipe,TimeAgoPipe]
})
export class TestDetailsComponent implements OnInit {
  test: any = null;
  loading = true;
  testId: string | null = null;

  statistics = {
    assignedStudents: 0,
    completedStudents: 0,
    averageScore: 0,
    passRate: 0
  };

  constructor(
    private route: ActivatedRoute,
    private db: Database
  ) {}

  ngOnInit(): void {
    this.testId = this.route.snapshot.paramMap.get('id');
    if (this.testId) {
      get(ref(this.db, `tests/${this.testId}`)).then(snapshot => {
        if (snapshot.exists()) {
          this.test = snapshot.val();
        }
        this.loading = false;
      });
    } else {
      this.loading = false;
    }
    this.computeStatistics();
  }

  async computeStatistics() {
    // Example: fetch all students for this grade and their testResults for this test
    const studentsSnap = await get(ref(this.db, 'users'));
    let assigned = 0, completed = 0, totalScore = 0, totalMiniGames = 0, passedAll = 0;

    if (studentsSnap.exists()) {
      const students = studentsSnap.val();
      for (const uid in students) {
        const student = students[uid];
        if (student.role === 'Student' && student.schoolGrade == this.test.grade) {
          assigned++;
          const testResult = student.testResults?.[this.test.testId];
          if (testResult && testResult.miniGames) {
            completed++;
            let studentPassedAll = true;
            for (const mgKey of this.test.miniGameOrder) {
              const mg = testResult.miniGames[mgKey];
              if (mg) {
                totalScore += mg.score || 0;
                totalMiniGames++;
                if (!mg.passed) studentPassedAll = false;
              } else {
                studentPassedAll = false;
              }
            }
            if (studentPassedAll) passedAll++;
          }
        }
      }
    }

    this.statistics.assignedStudents = assigned;
    this.statistics.completedStudents = completed;
    this.statistics.averageScore = totalMiniGames ? Math.round(totalScore / totalMiniGames) : 0;
    this.statistics.passRate = assigned ? Math.round((passedAll / assigned) * 100) : 0;
  }
}
