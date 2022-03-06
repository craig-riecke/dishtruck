import { Component, OnInit } from '@angular/core';
import {
  TransactionService,
  VerifyCheckout,
} from '../services/transaction.service';

@Component({
  selector: 'app-verify-checkout',
  templateUrl: './verify-checkout.component.html',
  styleUrls: ['./verify-checkout.component.scss'],
})
export class VerifyCheckoutComponent implements OnInit {
  verifyDetails: VerifyCheckout | undefined;

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.verifyDetails = this.transactionService.getLastVerifiedCheckout();
  }
}
