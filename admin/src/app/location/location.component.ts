import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import {
  AdminService,
  DishtruckLocation,
  LocationGroup,
} from '../services/admin.service';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss'],
})
export class LocationComponent implements OnInit, OnDestroy {
  readonly emptyQtys = { qty_metal: 0, qty_plastic: 0 };
  location_id: string;
  type: string;
  moveTrxForm = new UntypedFormGroup({
    to_location: new UntypedFormControl(null, Validators.required),
    qty_metal: new UntypedFormControl(0, Validators.required),
    qty_plastic: new UntypedFormControl(0, Validators.required),
  });
  locationGroups$: Observable<LocationGroup[]>;
  location$: Observable<DishtruckLocation>;
  postSubscription?: Subscription;
  readonly trxColumns = [
    'direction',
    'event_timestamp',
    'location',
    'qty_metal',
    'qty_plastic',
  ];
  isBusy = false;

  constructor(
    private route: ActivatedRoute,
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnDestroy(): void {
    this.postSubscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.locationGroups$ = this.adminService.getLocationGroups();
    this.reloadLocation();
  }

  reloadLocation() {
    this.isBusy = true;
    this.location$ = this.route.params.pipe(
      tap((params) => {
        this.isBusy = true;
        this.location_id = params['id'] || 'N/A';
        this.type = params['type'] || 'N/A';
      }),
      switchMap(() =>
        this.adminService.getLocation(this.type, this.location_id)
      ),
      tap(() => (this.isBusy = false))
    );
  }

  submitTransaction() {
    if (
      confirm(
        `Did you want to move ${this.moveTrxForm.controls['qty_plastic'].value} plastic and ${this.moveTrxForm.controls['qty_metal'].value} metal containers?`
      )
    ) {
      // Derive the to_type and to_location_id based on the location
      const trxForm = this.moveTrxForm.value;
      const [to_type, to_location_id] = trxForm.to_location.split('/');
      const adjustedTrxDefinition = {
        from_type: this.type,
        from_location_id: this.location_id,
        to_type,
        to_location_id,
        qty_metal: trxForm.qty_metal,
        qty_plastic: trxForm.qty_plastic,
      };
      console.log(adjustedTrxDefinition);
      this.isBusy = true;
      this.postSubscription = this.adminService
        .postTransaction(adjustedTrxDefinition)
        .subscribe(() => {
          alert('Qtys have been moved');
          this.moveTrxForm.setValue({
            qty_metal: 0,
            qty_plastic: 0,
            to_location: null,
          });
          this.reloadLocation();
        });
    }
  }
}
