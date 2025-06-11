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
  }
}
