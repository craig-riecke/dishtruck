import { Component, OnInit } from '@angular/core';
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

  constructor(private locationService: LocationService) {}

  ngOnInit(): void {
    this.dropoffPoints$ = this.locationService.getDropoffPoints();
  }
}
