import { Component, Output, EventEmitter } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Router, ActivatedRoute, NavigationEnd, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface Breadcrumb {
  label: string;
  route?: string;
}

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.css'],
  imports: [NgFor, NgIf, RouterLink],
  standalone: true
})
export class BreadcrumbsComponent {
  breadcrumbs: Breadcrumb[] = [];
  @Output() breadcrumbClick = new EventEmitter<Breadcrumb>();

  constructor(private router: Router, private route: ActivatedRoute) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.breadcrumbs = this.buildBreadcrumbs(this.route.root);
      });
  }
  ngOnInit() {
    // Initial breadcrumb build
    this.breadcrumbs = this.buildBreadcrumbs(this.route.root);
  }
  buildBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      // Only add breadcrumb if the route has a breadcrumb AND a non-empty path
      if (child.snapshot.data['breadcrumb'] && routeURL !== '') {
        breadcrumbs.push({
          label: child.snapshot.data['breadcrumb'],
          route: url
        });
      }

      return this.buildBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }

  onBreadcrumbClick(crumb: Breadcrumb) {
    if (crumb.route) {
      this.breadcrumbClick.emit(crumb);
    }
  }
}
