import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, switchMap, tap } from 'rxjs';
import { AdminService, Invoice } from '../services/admin.service';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss'],
})
export class InvoiceComponent implements OnInit {
  invoice$: Observable<Invoice>;
  params: any;
  readonly trxColumns = [
    'event_timestamp',
    'location',
    'qty_metal',
    'qty_plastic',
  ];

  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.invoice$ = this.route.params.pipe(
      tap((params) => (this.params = params)),
      switchMap((params) =>
        this.adminService.getInvoice(params['id'], params['from'], params['to'])
      )
    );
  }
}
