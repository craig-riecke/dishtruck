import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
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

  constructor(private locationService: LocationService) {}

  ngOnInit(): void {
    this.memberRecord$ = this.locationService.getMyMemberRecord();
  }
}
