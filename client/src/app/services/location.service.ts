import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export interface DishtruckLocation {
  id: number;
  type: 'member' | 'food-vendor' | 'dropoff-point' | 'unknown-member';
  unique_id?: number;
  full_name: string;
  qty_metal: number;
  qty_plastic: number;
  creation_date: Date;
  requires_sub_location: boolean;
  default_container_type: string;
  lat: number;
  lng: number;
  street_address: string;
  city: string;
  zip: string;
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

  registerMe() {
    return this.http.post<DishtruckLocation>(
      `${environment.DISHTRUCK_API_BASE_URL}/locations/register-me`,
      {} // Don't need anything - all of what we need is in the token
    );
  }

  getFoodVendors() {
    return this.http.get<DishtruckLocation[]>(
      `${environment.DISHTRUCK_API_BASE_URL}/locations/food-vendor`
    );
  }

  getDropoffPoints() {
    return this.http.get<DishtruckLocation[]>(
      `${environment.DISHTRUCK_API_BASE_URL}/locations/dropoff-point`
    );
  }

  getSubLocations(parent_location_id: number) {
    return this.http.get<DishtruckLocation[]>(
      `${environment.DISHTRUCK_API_BASE_URL}/locations/sublocations?parent_location_id=${parent_location_id}`
    );
  }
}
