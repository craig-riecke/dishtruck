import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocationService } from '../services/location.service';

@Component({
  selector: 'app-become-a-member',
  templateUrl: './become-a-member.component.html',
  styleUrls: ['./become-a-member.component.scss'],
})
export class BecomeAMemberComponent implements OnInit {
  constructor(
    private locationService: LocationService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  becomeAMember() {
    this.locationService
      .registerMe()
      .subscribe(() => this.router.navigate(['home']));
  }
}
