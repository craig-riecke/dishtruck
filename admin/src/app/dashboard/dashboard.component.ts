import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AdminService, LocationGroup } from '../services/admin.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  locationGroups$: Observable<LocationGroup[]>;
  isBusy = true;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.locationGroups$ = this.adminService
      .getLocationGroupsWithQtys()
      .pipe(tap(() => (this.isBusy = false)));
  }
}
