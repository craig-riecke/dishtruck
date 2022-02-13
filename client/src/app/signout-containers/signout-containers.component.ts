import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import {
  DishtruckLocation,
  LocationService,
} from '../services/location.service';
import { range } from 'lodash-es';
import { TransactionService } from '../services/transaction.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signout-containers',
  templateUrl: './signout-containers.component.html',
  styleUrls: ['./signout-containers.component.scss'],
})
export class SignoutContainersComponent implements OnInit, OnDestroy {
  affiliates$: Observable<DishtruckLocation[]>;
  containerNumbers = range(1, 10);
  signoutForm = new FormGroup({
    from_location_id: new FormControl(null, Validators.required),
    qty: new FormControl(null, Validators.required),
  });
  saving = false;
  selectedAffiliateName: string;
  saveSubscription: Subscription;

  constructor(
    private locationService: LocationService,
    private transactionService: TransactionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.affiliates$ = this.locationService.getAffiliates();
  }

  changeAffiliateTo(newId: number, affiliate_name: string) {
    this.signoutForm.controls['from_location_id'].setValue(newId);
    this.selectedAffiliateName = affiliate_name;
  }

  changeQtyTo(newQty: number) {
    this.signoutForm.controls['qty'].setValue(newQty);
  }

  saveSignout() {
    this.saving = true;
    this.saveSubscription = this.transactionService
      .signoutContainers(this.signoutForm.value, this.selectedAffiliateName)
      .subscribe(() => this.router.navigate(['verify-signout']));
  }

  ngOnDestroy(): void {
    this.saveSubscription?.unsubscribe();
  }
}
