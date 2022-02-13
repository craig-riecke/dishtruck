import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  TransactionService,
  VerifyCheckout,
} from '../services/transaction.service';

@Component({
  selector: 'app-verify-signout',
  templateUrl: './verify-signout.component.html',
  styleUrls: ['./verify-signout.component.scss'],
})
export class VerifySignoutComponent implements OnInit {
  verifyDetails: VerifyCheckout | undefined;

  constructor(
    private transactionService: TransactionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.verifyDetails = this.transactionService.getLastVerifiedCheckout();
  }
}
