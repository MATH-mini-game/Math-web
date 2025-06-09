import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Database } from '@angular/fire/database';
import { onValue, ref } from 'firebase/database';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-test-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './test-list.component.html',
  styleUrl: './test-list.component.css'
})
export class TestListComponent implements OnInit {
  private db = inject(Database);
  private auth = inject(AuthService);

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
        this.allTests = Object.values(all).filter((test: any) => test.teacherId === this.teacherUID);
        this.grades = [...new Set(this.allTests.map((t: any) => t.schoolGrade))];
        this.applyFilter();
        this.loading = false;
      });
    });
  }

  applyFilter() {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredTests = this.allTests.filter(t => {
      const matchesGrade = !this.selectedGrade || t.schoolGrade === this.selectedGrade;
      const matchesTitle = !term || (t.testName || '').toLowerCase().includes(term);
      return matchesGrade && matchesTitle;
    });
  }

  editTest(test: any) {
    // Implement navigation to edit page
    // Example: this.router.navigate(['/dashboard/tests', test.id, 'edit']);
  }

  endTest(test: any) {
    // Implement end test logic
    // Example: mark test as ended in your database
  }
}