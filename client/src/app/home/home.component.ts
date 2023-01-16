import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  DishtruckLocation,
  LocationService,
} from '../services/location.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  memberRecord$: Observable<DishtruckLocation>;
  loading: boolean = true;

  constructor(private locationService: LocationService) {}

  ngOnInit(): void {
    this.memberRecord$ = this.locationService
      .getMyMemberRecord()
      .pipe(tap(() => (this.loading = false)));
  }
}
