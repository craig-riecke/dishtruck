import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { format } from 'date-fns';
import { Observable } from 'rxjs';

export interface Balance {
  qty_plastic: number;
  qty_metal: number;
}

export interface Transaction {
  event_timestamp: Date;
  location_id: number;
  location_name: string;
  qty_plastic: number;
  qty_metal: number;
}

export interface TransactionHistory {
  location_name: string;
  location_type: string;
  balance_forward: Balance;
  transactions: Transaction[];
  balance_at_end: Balance;
  current_balance: Balance;
}

export interface MoveTransaction {
  from_location_id: number;
  to_location_id: number;
  qty_plastic: number;
  qty_metal: number;
}

export interface DishtruckLocation {
  id: number;
  type:
    | 'member'
    | 'food-vendor'
    | 'dropoff-point'
    | 'unknown-member'
    | 'warehouse'
    | 'shrinkage';
  unique_id?: number;
  full_name: string;
  qty_metal: number;
  qty_plastic: number;
  creation_date: Date;
  requires_sub_location: boolean;
  parent_location_id: number;
  default_container_type: string;
  lat: number;
  lng: number;
  street_address: string;
  city: string;
  zip: string;
}

export interface LocationGroup {
  group: string;
  locations: DishtruckLocation[];
  qty_metal: number;
  qty_plastic: number;
}

export interface Invoice {
  location_name: string;
  transactions: Transaction[];
  invoice_balance: Balance;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(private http: HttpClient) {}

  getHistory(
    location_id: number,
    from: Date,
    to: Date
  ): Observable<TransactionHistory> {
    return this.http.get<TransactionHistory>(
      `${
        environment.DISHTRUCK_API_BASE_URL
      }/admin/transactions?location_id=${location_id}&from=${format(
        from,
        'yyyy-MM-dd'
      )}&to=${format(to, 'yyyy-MM-dd')}`
    );
  }

  postTransaction(moveTrx: MoveTransaction): Observable<void> {
    return this.http.post<void>(
      `${environment.DISHTRUCK_API_BASE_URL}/admin/transactions`,
      moveTrx
    );
  }

  // This is a public API - you don't need a JWT.
  getLocationGroups(): Observable<LocationGroup[]> {
    return this.http.get<LocationGroup[]>(
      `${environment.DISHTRUCK_API_BASE_URL}/admin/locations`
    );
  }

  getLocationGroupsWithQtys(): Observable<LocationGroup[]> {
    return this.http.get<LocationGroup[]>(
      `${environment.DISHTRUCK_API_BASE_URL}/admin/locations-with-qtys`
    );
  }

  getInvoice(
    location_id: number,
    from: string,
    to: string
  ): Observable<Invoice> {
    return this.http.get<Invoice>(
      `${environment.DISHTRUCK_API_BASE_URL}/admin/invoice?location_id=${location_id}&from=${from}&to=${to}`
    );
  }
}
