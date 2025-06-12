import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Database, ref, get, update } from '@angular/fire/database';
import { DatePipe, NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

@Component({
  selector: 'app-student-details',
  templateUrl: './student-details.component.html',
  styleUrls: ['./student-details.component.css'],
  standalone: true,
  imports: [RouterLink, NgIf, NgFor,NgClass,NgStyle]
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
          // Fetch assigned tests by grade, EXCLUDE drafts here
          if (this.student?.schoolGrade) {
            get(ref(this.db, `tests`)).then(testsSnap => {
              if (testsSnap.exists()) {
                const allTests = Object.values(testsSnap.val());
                this.assignedTests = allTests.filter((test: any) =>
                  test.grade == this.student.schoolGrade && !test.isDraft
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

  getTestKeys(testResults: any): string[] {
    return Object.keys(testResults || {});
  }
  getMiniGameKeys(miniGames: any): string[] {
    return Object.keys(miniGames || {});
  }

  getTestSummary(student: any) {
    let totalMiniGames = 0, passedMiniGames = 0, totalScore = 0;
    if (!student?.testResults) return { totalMiniGames: 0, passedMiniGames: 0, avgScore: 0 };
    for (const test of Object.values(student.testResults)) {
      for (const mg of Object.values((test as any).miniGames || {})) {
        totalMiniGames++;
        if ((mg as any).passed) passedMiniGames++;
        totalScore += (mg as any).score || 0;
      }
    }
    return {
      totalMiniGames,
      passedMiniGames,
      avgScore: totalMiniGames ? Math.round(totalScore / totalMiniGames) : 0
    };
  }

  getTestName(testKey: string): string {
    const test = this.assignedTests?.find(t => t.testId === testKey);
    return test ? test.testName : testKey;
  }

  async downloadPDF(student: any) {
    const qrData = JSON.stringify({ uid: student.uid, pin: student.password });
    const qrUrl = await QRCode.toDataURL(qrData);

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Student QR Code Login", 20, 20);

    doc.setFontSize(12);
    doc.text(`First Name: ${student.firstName}`, 20, 30);
    doc.text(`Last Name: ${student.lastName}`, 20, 40);
    doc.text(`Grade: ${student.schoolGrade}`, 20, 50);
    doc.text(`Birth Date: ${student.birthday || ''}`, 20, 60);
    doc.text(`Gender: ${student.gender || ''}`, 20, 70);
    doc.text(`PIN: ${student.password}`, 20, 80);
    doc.text("Scan the QR code below to log in:", 20, 100);

    doc.addImage(qrUrl, "PNG", 20, 110, 100, 100);

    const filename = `student-${student.firstName}-${student.lastName}-G${student.schoolGrade}.pdf`;
    doc.save(filename);
  }
}
