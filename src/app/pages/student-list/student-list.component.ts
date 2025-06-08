import { Component, inject, input, OnInit, Output, EventEmitter } from '@angular/core';
import { Database, ref, get, update } from '@angular/fire/database';
import { AuthService } from '../../services/auth.service'; 
import { CommonModule, NgIf } from '@angular/common';
import { Router ,RouterLink} from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule,NgIf, RouterLink, FormsModule],
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.css']
})
export class StudentListComponent implements OnInit {
  private db = inject(Database);
  private auth = inject(AuthService);

  students: any[] = [];
  filteredStudents: any[] = [];
  loading = true;
  searchTerm: string = '';
  selectedGrade: string = '';
  teacherUID = '';
  @Output() sectionSelected = new EventEmitter<string>();

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
        this.filteredStudents = [...this.students];
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
      this.filteredStudents = this.filteredStudents.filter(s => s.uid !== uid);
    } catch (error) {
      console.error('Error unlinking student:', error);
    }
  }
  registerStudent() {
    this.sectionSelected.emit('registerStudent');
  }
  
  filterStudents() {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredStudents = this.students.filter(student => {
      const matchesName =
        (student.firstName + ' ' + student.lastName).toLowerCase().includes(term);
      const matchesGrade =
        !this.selectedGrade || student.schoolGrade == this.selectedGrade;
      return matchesName && matchesGrade;
    });
  }
}