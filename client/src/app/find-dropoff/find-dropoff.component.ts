import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import {
  DishtruckLocation,
  LocationService,
} from '../services/location.service';

@Component({
  selector: 'app-find-dropoff',
  templateUrl: './find-dropoff.component.html',
  styleUrls: ['./find-dropoff.component.scss'],
})
export class FindDropoffComponent implements OnInit {
  dropoffPoints$: Observable<DishtruckLocation[]>;

  constructor(
    private locationService: LocationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.dropoffPoints$ = this.locationService.getDropoffPoints();
  }

  gotoDropoff(locid: string) {
    this.router.navigateByUrl(`/dropoff-containers/${locid}`);
  }
}
