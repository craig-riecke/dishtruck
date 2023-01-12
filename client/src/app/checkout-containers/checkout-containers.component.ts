import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
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
  memberRecord$: Observable<DishtruckLocation>;
  foodVendors$: Observable<DishtruckLocation[]>;
  foodSubVendors$: Observable<DishtruckLocation[]>;
  containerNumbers = range(1, 10);
  signoutForm = new UntypedFormGroup({
    from_location_id: new UntypedFormControl(null, Validators.required),
    from_sublocation_id: new UntypedFormControl(null),
    qty: new UntypedFormControl(null, Validators.required),
  });
  saving = false;
  selectedfoodVendorId: string | null = null;
  selectedfoodVendorName: string | null = null;
  selectedQty: number | null = null;
  saveSubscription: Subscription;
  returnDate: Date = addDays(new Date(), 7);
  defaultContainerType: string;
  showSubLocations = false;

  constructor(
    private locationService: LocationService,
    private transactionService: TransactionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.memberRecord$ = this.locationService.getMyMemberRecord();
    this.foodVendors$ = this.locationService.getFoodVendors();
  }

  @ViewChild('stepper') private myStepper: MatStepper;

  changeFoodVendorTo(foodVendor: DishtruckLocation) {
    if (foodVendor.requires_sub_location) {
      this.showSubLocations = true;
      this.signoutForm.controls['from_location_id'].setValue(foodVendor.id);
      this.foodSubVendors$ = this.locationService.getSubLocations(
        foodVendor.id
      );
    } else {
      if (foodVendor.parent_location_id) {
        this.signoutForm.controls['from_sublocation_id'].setValue(
          foodVendor.id
        );
      } else {
        this.showSubLocations = false;
        this.signoutForm.controls['from_location_id'].setValue(foodVendor.id);
      }
      this.selectedfoodVendorId = foodVendor.id;
      this.selectedfoodVendorName = foodVendor.full_name;
      this.defaultContainerType = foodVendor.default_container_type;
      this.myStepper.next();
    }
  }

  changeQtyTo(newQty: number) {
    this.signoutForm.controls['qty'].setValue(newQty);
    this.selectedQty = newQty;
    this.returnDate = addDays(new Date(), 7);
    this.myStepper.next();
  }

  saveCheckout() {
    this.saving = true;
    // Shouldn't happen because of validation
    if (
      !this.selectedfoodVendorName ||
      !this.selectedQty ||
      !this.selectedfoodVendorId
    ) {
      alert('Select a vendor and qty first');
      return;
    }
    const trx = {
      qty: this.selectedQty,
      from_location_id: this.selectedfoodVendorId,
    };
    this.saveSubscription = this.transactionService
      .checkoutContainers(trx, this.selectedfoodVendorName)
      .subscribe(() => this.router.navigate(['verify-checkout']));
  }

  ngOnDestroy(): void {
    this.saveSubscription?.unsubscribe();
  }
}
