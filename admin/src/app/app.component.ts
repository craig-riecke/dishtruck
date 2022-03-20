import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, Observable } from 'rxjs';
import { AdminService, LocationGroup } from './services/admin.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map((result) => result.matches));
  locationGroups$: Observable<LocationGroup[]>;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.locationGroups$ = this.adminService.getLocationGroups();
  }
}
