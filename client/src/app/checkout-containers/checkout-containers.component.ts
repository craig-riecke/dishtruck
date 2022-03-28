import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin, map, Observable, Subscription } from 'rxjs';
import {
  DishtruckLocation,
  LocationService,
} from '../services/location.service';
import { range } from 'lodash-es';
import { TransactionService } from '../services/transaction.service';
import { Router } from '@angular/router';
import { MatStepper } from '@angular/material/stepper';
import { addDays } from 'date-fns';

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
  selectedfoodVendorName: string | null = null;
  saveSubscription: Subscription;
  selectedParentLocation?: number;
  returnDate: Date = addDays(new Date(), 7);
  defaultContainerType: string;

  constructor(
    private locationService: LocationService,
    private transactionService: TransactionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.foodVendors$ = this.locationService.getFoodVendors();
  }

  @ViewChild('stepper') private myStepper: MatStepper;

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
      this.defaultContainerType = foodVendor.default_container_type;
      this.myStepper.next();
    }
  }

  changeQtyTo(newQty: number) {
    this.signoutForm.controls['qty'].setValue(newQty);
    this.returnDate = addDays(new Date(), 7);
    this.myStepper.next();
  }

  saveCheckout() {
    this.saving = true;
    // Shouldn't happen because of validation
    if (!this.selectedfoodVendorName) {
      alert('Select a vendor first');
      return;
    }
    this.saveSubscription = this.transactionService
      .checkoutContainers(this.signoutForm.value, this.selectedfoodVendorName)
      .subscribe(() => this.router.navigate(['verify-checkout']));
  }

  ngOnDestroy(): void {
    this.saveSubscription?.unsubscribe();
  }
}
