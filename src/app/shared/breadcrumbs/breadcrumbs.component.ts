import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
export interface Breadcrumb {
  label: string;
  route?: string; // Optional: if you want to make it clickable
}

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.css'],
  imports: [NgFor, NgIf]

})
export class BreadcrumbsComponent {
  @Input() breadcrumbs: Breadcrumb[] = [];
  @Output() breadcrumbClick = new EventEmitter<Breadcrumb>();

  onBreadcrumbClick(crumb: Breadcrumb) {
    if (crumb.route) {
      this.breadcrumbClick.emit(crumb);
    }
  }
}
