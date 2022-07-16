import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { format } from 'date-fns';
import { Observable } from 'rxjs';

export interface Balance {
  qty_plastic: number;
  qty_metal: number;
}

export interface MoveTransaction {
  from_type: string;
  from_location_id: string;
  to_type: string;
  to_location_id: string;
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

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(private http: HttpClient) {}

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

  getLocation(type: string, id: string): Observable<DishtruckLocation> {
    return this.http.get<DishtruckLocation>(
      `${environment.DISHTRUCK_API_BASE_URL}/location/${type}?id=${id}`
    );
  }
}
