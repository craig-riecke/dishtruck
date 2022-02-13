import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export interface DishtruckLocation {
  id: number;
  type: 'member' | 'affiliate' | 'dropoff-point';
  unique_id?: number;
  full_name: string;
  qty_metal: number;
  qty_plastic: number;
  creation_date: Date;
}

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  constructor(private http: HttpClient) {}

  getMyMemberRecord() {
    return this.http.get<DishtruckLocation>(
      `${environment.DISHTRUCK_API_BASE_URL}/locations/me`
    );
  }

  getAffiliates() {
    return this.http.get<DishtruckLocation[]>(
      `${environment.DISHTRUCK_API_BASE_URL}/locations/affiliate`
    );
  }

  getDropoffPoints() {
    return this.http.get<DishtruckLocation[]>(
      `${environment.DISHTRUCK_API_BASE_URL}/locations/dropoff-point`
    );
  }
}
