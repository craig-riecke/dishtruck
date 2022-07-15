import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { range, toInteger } from 'lodash-es';
import { filter, map, Subscription, switchMap, tap } from 'rxjs';
import {
  DishtruckLocation,
  LocationService,
} from '../services/location.service';
import { TransactionService } from '../services/transaction.service';

@Component({
  selector: 'app-dropoff-containers',
  templateUrl: './dropoff-containers.component.html',
  styleUrls: ['./dropoff-containers.component.scss'],
})
export class DropoffContainersComponent implements OnInit, OnDestroy {
  dropoffSubscription: Subscription;
  saveSubscription: Subscription;
  containerNumbers: { plastic: number[]; metal: number[] };
  dropoffForm = new UntypedFormGroup({
    qty_metal: new UntypedFormControl(0, Validators.required),
    qty_plastic: new UntypedFormControl(0, Validators.required),
  });
  saving = false;
  dropoffPoint?: DishtruckLocation;
  memberRecord: DishtruckLocation;

  constructor(
    private locationService: LocationService,
    private transactionService: TransactionService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    let dropoffLocationId = 0;
    this.dropoffSubscription = this.route.params
      .pipe(
        tap((params) => (dropoffLocationId = params['to_location_id'])),
        switchMap(() => this.locationService.getDropoffPoints()),
        map((resp) => resp.find((loc) => loc.id === dropoffLocationId)),
        tap((resp) => (this.dropoffPoint = resp)),
        switchMap(() => this.locationService.getMyMemberRecord())
      )
      .subscribe((resp) => {
        this.memberRecord = resp;
        this.containerNumbers = {
          plastic: range(0, this.memberRecord.qty_plastic + 1),
          metal: range(0, this.memberRecord.qty_metal + 1),
        };
        if (!this.dropoffPoint) {
          alert('The QR Code you used is incorrect.  Please try again.');
          return;
        }
      });
  }

  changePlasticQtyTo(newQty: number) {
    this.dropoffForm.controls['qty_plastic'].setValue(newQty);
  }

  changeMetalQtyTo(newQty: number) {
    this.dropoffForm.controls['qty_metal'].setValue(newQty);
  }

  saveDropoff() {
    if (!this.dropoffPoint) {
      alert('You are not at a valid dropoff point');
      return;
    }
    this.saving = true;
    const saveRec = {
      ...this.dropoffForm.value,
      to_location_id: this.dropoffPoint.id,
    };
    this.saveSubscription = this.transactionService
      .dropoffContainers(saveRec)
      .subscribe(() => this.router.navigate(['home']));
  }

  ngOnDestroy(): void {
    this.dropoffSubscription?.unsubscribe();
    this.saveSubscription?.unsubscribe();
  }
}
