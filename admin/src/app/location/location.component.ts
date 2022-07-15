import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import {
  AdminService,
  LocationGroup,
  TransactionHistory,
} from '../services/admin.service';
import { toInteger } from 'lodash-es';
import { endOfMonth, format, startOfMonth } from 'date-fns';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss'],
})
export class LocationComponent implements OnInit, OnDestroy {
  readonly emptyQtys = { qty_metal: 0, qty_plastic: 0 };
  readonly loadingSentinel: TransactionHistory = {
    location_name: 'Loading',
    location_type: '',
    balance_forward: this.emptyQtys,
    balance_at_end: this.emptyQtys,
    current_balance: this.emptyQtys,
    transactions: [],
  };
  trxHistory$: BehaviorSubject<TransactionHistory> =
    new BehaviorSubject<TransactionHistory>(this.loadingSentinel);
  location_id?: number;
  dateRangeForm = new UntypedFormGroup({
    start: new UntypedFormControl(startOfMonth(new Date())),
    end: new UntypedFormControl(endOfMonth(new Date())),
  });
  moveTrxForm = new UntypedFormGroup({
    from_location_id: new UntypedFormControl(null),
    to_location_id: new UntypedFormControl(null, Validators.required),
    qty_metal: new UntypedFormControl(0, Validators.required),
    qty_plastic: new UntypedFormControl(0, Validators.required),
  });
  locationGroups$: Observable<LocationGroup[]>;
  postSubscription?: Subscription;
  readonly trxColumns = [
    'direction',
    'event_timestamp',
    'location',
    'qty_metal',
    'qty_plastic',
  ];

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
    this.route.params
      .pipe(
        tap((params) => {
          this.location_id = toInteger(params['id']);
          this.moveTrxForm.controls['from_location_id'].setValue(
            this.location_id
          );
        }),
        switchMap(() =>
          this.adminService.getHistory(
            this.location_id || -1,
            this.dateRangeForm.controls['start'].value,
            this.dateRangeForm.controls['end'].value
          )
        )
      )
      .subscribe((hist) => this.trxHistory$?.next(hist));
    this.dateRangeForm.controls['end'].valueChanges.subscribe(() =>
      this.reloadHistory()
    );
  }

  reloadHistory() {
    if (
      !this.dateRangeForm.controls['start'].value ||
      !this.dateRangeForm.controls['end'].value
    ) {
      return;
    }
    this.adminService
      .getHistory(
        this.location_id || -1,
        this.dateRangeForm.controls['start'].value,
        this.dateRangeForm.controls['end'].value
      )
      .subscribe((hist) => this.trxHistory$?.next(hist));
  }

  submitTransaction() {
    if (
      confirm(
        `Did you want to move ${this.moveTrxForm.controls['qty_plastic'].value} plastic and ${this.moveTrxForm.controls['qty_metal'].value} metal containers?`
      )
    ) {
      this.postSubscription = this.adminService
        .postTransaction(this.moveTrxForm.value)
        .subscribe(() => {
          alert('Qtys have been moved');
          this.reloadHistory();
        });
    }
  }

  generateInvoice() {
    const fromDate = format(
      this.dateRangeForm.controls['start'].value,
      'yyyy-MM-dd'
    );
    const toDate = format(
      this.dateRangeForm.controls['end'].value,
      'yyyy-MM-dd'
    );
    this.router.navigateByUrl(
      `/location/${this.location_id}/invoice/${fromDate}/${toDate}`
    );
  }
}
