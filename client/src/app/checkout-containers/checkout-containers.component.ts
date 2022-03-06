import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin, map, Observable, Subscription } from 'rxjs';
import {
  DishtruckLocation,
  LocationService,
} from '../services/location.service';
import { range } from 'lodash-es';
import { TransactionService } from '../services/transaction.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signout-containers',
  templateUrl: './checkout-containers.component.html',
  styleUrls: ['./checkout-containers.component.scss'],
})
export class CheckoutContainersComponent implements OnInit, OnDestroy {
  foodVendors$: Observable<DishtruckLocation[]>;
  containerNumbers = range(1, 10);
  signoutForm = new FormGroup({
    from_location_id: new FormControl(null, Validators.required),
    qty: new FormControl(null, Validators.required),
  });
  saving = false;
  selectedfoodVendorName: string;
  saveSubscription: Subscription;
  selectedParentLocation?: number;

  constructor(
    private locationService: LocationService,
    private transactionService: TransactionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.foodVendors$ = this.locationService.getFoodVendors();
  }

  changeFoodVendorTo(foodVendor: DishtruckLocation) {
    if (foodVendor.requires_sub_location) {
      if (!this.selectedParentLocation) {
        this.foodVendors$ = forkJoin([
          this.locationService.getFoodVendors(),
          this.locationService.getSubLocations(foodVendor.id),
        ]).pipe(
          map(([primaryFoodVendors, subFoodVendors]) => [
            ...primaryFoodVendors,
            ...subFoodVendors,
          ])
        );
      }
    } else {
      this.signoutForm.controls['from_location_id'].setValue(foodVendor.id);
      this.selectedfoodVendorName = foodVendor.full_name;
    }
  }

  changeQtyTo(newQty: number) {
    this.signoutForm.controls['qty'].setValue(newQty);
  }

  saveCheckout() {
    this.saving = true;
    this.saveSubscription = this.transactionService
      .checkoutContainers(this.signoutForm.value, this.selectedfoodVendorName)
      .subscribe(() => this.router.navigate(['verify-checkout']));
  }

  ngOnDestroy(): void {
    this.saveSubscription?.unsubscribe();
  }
}
