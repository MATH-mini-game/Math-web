import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NgClass, NgFor } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [ NgClass, NgFor, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  navItems: NavItem[] = [];
  userRole: string | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.auth.getCurrentUserWithRole().subscribe(user => {
      if (user) this.userRole = user.role?.toLowerCase();
      this.updateNavItems();
    });

    if (localStorage.getItem('darkMode') === '1') {
      document.body.classList.add('dark-mode');
    }
  }

  updateNavItems() {
    const roleSpecificItems: { [key: string]: NavItem[] } = {
      administrator: [
        { path: '', icon: 'dashboard', label: 'Dashboard' },
        { path: 'students', icon: 'people', label: 'Students' },
        { path: 'tests', icon: 'assignment', label: 'Tests' }
      ],
      teacher: [
        { path: '', icon: 'chart-pie-slice', label: 'Dashboard' },
        { path: 'students', icon: 'student', label: 'Students' },
        { path: 'tests', icon: 'note', label: 'Tests' }
      ]
      // Add more roles as needed
    };

    this.navItems = this.userRole ? roleSpecificItems[this.userRole] || [] : [];
  }

  isActive(path: string): boolean {
    if (path === '' || path === 'dashboard') {
      // Active only if at /dashboard or /dashboard/
      return this.router.url === '/dashboard' || this.router.url === '/dashboard/';
    }
    // For subpaths, check if the URL starts with /dashboard/path
    return this.router.url.startsWith(`/dashboard/${path}`);
  }

  logout() {
    this.auth.logout().then(() => window.location.reload());
  }

  toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    // Optionally, save preference to localStorage
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark ? '1' : '0');
  }
  get isDarkMode(): boolean {
  return document.body.classList.contains('dark-mode');
}
}