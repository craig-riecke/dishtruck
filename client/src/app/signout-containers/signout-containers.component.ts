import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import {
  DishtruckLocation,
  LocationService,
} from '../services/location.service';
import { range } from 'lodash-es';

@Component({
  selector: 'app-signout-containers',
  templateUrl: './signout-containers.component.html',
  styleUrls: ['./signout-containers.component.scss'],
})
export class SignoutContainersComponent implements OnInit {
  affiliates$: Observable<DishtruckLocation[]>;
  containerNumbers = range(1, 10);
  signoutForm = new FormGroup({
    affiliate_location_id: new FormControl(null, Validators.required),
    qty: new FormControl(null, Validators.required),
  });
  saving = false;

  constructor(private locationService: LocationService) {}

  ngOnInit(): void {
    this.affiliates$ = this.locationService.getAffiliates();
  }

  changeAffiliateTo(newId: number) {
    this.signoutForm.controls['affiliate_location_id'].setValue(newId);
  }

  changeQtyTo(newQty: number) {
    this.signoutForm.controls['qty'].setValue(newQty);
  }

  saveSignout() {
    this.saving = true;
  }
}
