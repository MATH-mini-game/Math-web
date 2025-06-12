import { Component, inject, OnInit } from '@angular/core';
import { Database, ref, get } from '@angular/fire/database';
import { AuthService } from '../../services/auth.service';
import { NgFor, NgIf, NgClass, SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css'],
  standalone: true,
  imports: [SlicePipe, RouterLink, NgFor, NgIf, NgClass]
})
export class DashboardHomeComponent implements OnInit {
  private db = inject(Database);
  private auth = inject(AuthService);

  teacher: any = null;
  students: any[] = [];
  tests: any[] = [];
  loading = true;

  ngOnInit(): void {
    this.auth.getCurrentUserWithRole().subscribe(async (user) => {
      if (!user || user.role !== 'Teacher') {
        this.loading = false;
        return;
      }
      this.teacher = user;

      // Fetch students linked to this teacher
      const usersSnap = await get(ref(this.db, 'users'));
      if (usersSnap.exists()) {
        const users = usersSnap.val();
        this.students = Object.values(users).filter((u: any) =>
          u.role === 'Student' && u.linkedTeacherId === user.uid
        );
      }

      // Fetch tests created by this teacher
      const testsSnap = await get(ref(this.db, 'tests'));
      if (testsSnap.exists()) {
        const allTests = Object.values(testsSnap.val());
        this.tests = allTests.filter((t: any) => t.teacherId === user.uid);
      }

      this.loading = false;
    });
  }
}
