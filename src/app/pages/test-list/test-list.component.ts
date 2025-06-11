import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Database } from '@angular/fire/database';
import { onValue, ref } from 'firebase/database';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { update, remove, ref as dbRef } from 'firebase/database';
import { TimeAgoPipe } from './time-ago.pipe';

@Component({
  selector: 'app-test-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TimeAgoPipe],
  templateUrl: './test-list.component.html',
  styleUrl: './test-list.component.css'
})
export class TestListComponent implements OnInit {
  private db = inject(Database);
  private auth = inject(AuthService);
  private router = inject(Router);

  teacherUID = '';
  allTests: any[] = [];
  filteredTests: any[] = [];
  grades: string[] = [];
  selectedGrade = '';
  searchTerm = '';
  loading = true;

  ngOnInit() {
    this.auth.getCurrentUserWithRole().subscribe(user => {
      if (!user) return;
      this.teacherUID = user.uid;

      const testsRef = ref(this.db, 'tests');
      onValue(testsRef, (snapshot) => {
        const all = snapshot.val() || {};
        this.allTests = Object.values(all)
          .filter((test: any) => test.teacherId === this.teacherUID)
          .sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0)); // Sort by latest created
        this.grades = [...new Set(this.allTests.map((t: any) => t.grade))];
        this.applyFilter();
        this.loading = false;
      });
    });
  }

  applyFilter() {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredTests = this.allTests.filter(t => {
      const matchesGrade = !this.selectedGrade || t.grade === this.selectedGrade;
      const matchesTitle = !term || (t.testName || '').toLowerCase().includes(term);
      return matchesGrade && matchesTitle;
    });
  }

  navigateToTest(test: any) {
    this.router.navigate(['/dashboard/tests', test.testId]);
  }

  editTest(test: any) {
    // Implement navigation to edit page
    // Example: this.router.navigate(['/dashboard/tests', test.id, 'edit']);
  }

  publishTest(test: any) {
    if (!test?.testId) return;
    update(dbRef(this.db, `tests/${test.testId}`), {
      status: 'published',
      isDraft: false
    });
  }

  endTest(test: any) {
    if (!test?.testId) return;
    update(dbRef(this.db, `tests/${test.testId}`), {
      status: 'stopped'
    });
  }

  deleteTest(test: any) {
    if (!test?.testId) return;
    remove(dbRef(this.db, `tests/${test.testId}`));
  }
}