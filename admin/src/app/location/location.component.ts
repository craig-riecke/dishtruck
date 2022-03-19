import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { AdminService, TransactionHistory } from '../services/admin.service';
import { groupBy, toInteger } from 'lodash-es';

interface NonMemberLocation {
  value: number;
  viewValue: string;
  grp: string;
}

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss'],
})
export class LocationComponent implements OnInit, OnDestroy {
  dataSource$: Observable<TransactionHistory> | null = null;
  location_id?: number;
  moveTrxForm = new FormGroup({
    from_location_id: new FormControl(null),
    to_location_id: new FormControl(null, Validators.required),
    qty_metal: new FormControl(0, Validators.required),
    qty_plastic: new FormControl(0, Validators.required),
  });
  // TODO: Replace with API Call
  nonMemberLocations = [
    { value: 17, viewValue: 'Warehouse', grp: 'Warehouse' },
    { value: 2, viewValue: 'Grassroots #1', grp: 'Food Vendors' },
    { value: 3, viewValue: 'Grassroots #2', grp: 'Food Vendors' },
    { value: 4, viewValue: 'Grassroots #3', grp: 'Food Vendors' },
    { value: 5, viewValue: 'Greenstar', grp: 'Food Vendors' },
    { value: 6, viewValue: 'Ithaca Re-Use Center', grp: 'Drop-Off Points' },
    { value: 7, viewValue: 'Gorges Cycles', grp: 'Drop-Off Points' },
    { value: 18, viewValue: 'Shrinkage', grp: 'Shrinkage' },
  ];
  nonMemberLocationsGroups = groupBy(this.nonMemberLocations, 'grp');
  postSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private adminService: AdminService
  ) {}

  ngOnDestroy(): void {
    this.postSubscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.reloadHistory();
  }

  reloadHistory() {
    this.dataSource$ = this.route.params.pipe(
      tap((params) => {
        this.location_id = toInteger(params['id']);
        this.moveTrxForm.controls['from_location_id'].setValue(
          this.location_id
        );
      }),
      switchMap(() =>
        this.adminService.getHistory(
          this.location_id || -1,
          new Date('2022-03-01'),
          new Date('2022-03-31')
        )
      ),
      map((hist: TransactionHistory) => ({
        ...hist,
        // We pretend the balanceForward is an actual transaction.  It makes display easier.
        transactions: [
          {
            event_timestamp: new Date(),
            location_id: -1,
            location_name: 'BALANCE FORWARD',
            ...hist.balance_forward,
          },
          ...hist.transactions,
        ],
      }))
    );
  }

  submitTransaction() {
    if (
      confirm(
        `Did you want to move ${this.moveTrxForm.controls['qty_plastic'].value} plastic and ${this.moveTrxForm.controls['qty_plastic'].value} metal containers?`
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
}
