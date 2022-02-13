import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { tap } from 'rxjs';

export interface CheckoutContainerAction {
  qty: number;
  from_location_id: number;
}

export interface VerifyCheckout {
  qty: number;
  affiliate_name: string;
}

export interface DropoffContainerAction {
  qty_metal: number;
  qty_plastic: number;
  to_location_id: number;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  checkedOut?: VerifyCheckout;

  constructor(private http: HttpClient) {}

  signoutContainers(
    checkoutContainerAction: CheckoutContainerAction,
    affiliate_name: string
  ) {
    return this.http
      .post<void>(
        `${environment.DISHTRUCK_API_BASE_URL}/transactions/checkout-container`,
        checkoutContainerAction
      )
      .pipe(
        tap(
          () =>
            (this.checkedOut = {
              qty: checkoutContainerAction.qty,
              affiliate_name,
            })
        )
      );
  }

  getLastVerifiedCheckout(): VerifyCheckout | undefined {
    return this.checkedOut;
  }

  dropoffContainers(dropoffContainerAction: DropoffContainerAction) {
    return this.http.post<void>(
      `${environment.DISHTRUCK_API_BASE_URL}/transactions/return-container`,
      dropoffContainerAction
    );
  }
}