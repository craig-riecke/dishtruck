import { Injectable } from '@angular/core';
import { SocialUser } from '@abacritt/angularx-social-login';

@Injectable({
  providedIn: 'root',
})
export class CurrentUserService {
  private currentUser: SocialUser | null = null;

  constructor() {}

  setCurrentUser(user: SocialUser) {
    this.currentUser = user;
  }

  currentUserSnapshot() {
    return this.currentUser;
  }
}
