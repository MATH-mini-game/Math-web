import { Component, inject, OnInit } from '@angular/core';
import { Database, ref, get, update } from '@angular/fire/database';
import { AuthService } from '../../services/auth.service'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.css'
})
export class StudentListComponent {
  private db = inject(Database);
  private auth = inject(AuthService);

  students: any[] = [];
  loading = true;
  teacherUID = '';

  ngOnInit(): void {
    this.auth.getCurrentUserWithRole().subscribe(async (user) => {
      if (!user || user.role !== 'Teacher') return;

      this.teacherUID = user.uid;
      const snapshot = await get(ref(this.db, 'users'));

      if (snapshot.exists()) {
        const allUsers = snapshot.val();
        this.students = Object.values(allUsers).filter((user: any) =>
          user.role === 'Student' && user.linkedTeacherId === this.teacherUID
        );
      }

      this.loading = false;
    });
  }

  async unlinkStudent(uid: string) {
    try {
      await update(ref(this.db, `users/${uid}`), {
        linkedTeacherId: null
      });
      this.students = this.students.filter(s => s.uid !== uid);
    } catch (error) {
      console.error('Error unlinking student:', error);
    }
  }
}