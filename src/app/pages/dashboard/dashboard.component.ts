import { Component, EventEmitter, output } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NgIf } from '@angular/common';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { BreadcrumbsComponent } from '../../shared/breadcrumbs/breadcrumbs.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [NgIf, SidebarComponent, 
     BreadcrumbsComponent, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  userRole: string | null = null;
  loading = true;
  selectedSection = 'dashboard';
  sectionSelected = new EventEmitter<string>();
  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.auth.getCurrentUserWithRole().subscribe(user => {
      if (user) this.userRole = user.role;
      this.loading = false;
      
    });
  }

  onSectionSelected(section: string) {
    this.selectedSection = section;
    console.log(section)
  }
    
}