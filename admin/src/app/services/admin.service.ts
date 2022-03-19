import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { format } from 'date-fns';

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

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(private http: HttpClient) {}

  getHistory(location_id: number, from: Date, to: Date) {
    return this.http.get<TransactionHistory>(
      `${
        environment.DISHTRUCK_API_BASE_URL
      }/admin/transactions?location_id=${location_id}&from=${format(
        from,
        'yyyy-MM-dd'
      )}&to=${format(to, 'yyyy-MM-dd')}`
    );
  }

  postTransaction(moveTrx: MoveTransaction) {
    return this.http.post<void>(
      `${environment.DISHTRUCK_API_BASE_URL}/admin/transactions`,
      moveTrx
    );
  }
}
