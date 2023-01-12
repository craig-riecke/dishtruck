import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { tap } from 'rxjs';

export interface CheckoutContainerAction {
  qty: number;
  from_location_id: string;
}

export interface VerifyCheckout {
  qty: number;
  food_vendor_name: string;
  timestamp: Date;
}

export interface DropoffContainerAction {
  qty_metal: number;
  qty_plastic: number;
  to_location_id: string;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  checkedOut?: VerifyCheckout;

  constructor(private http: HttpClient) {}

  checkoutContainers(
    checkoutContainerAction: CheckoutContainerAction,
    food_vendor_name: string
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
              food_vendor_name,
              timestamp: new Date(),
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
