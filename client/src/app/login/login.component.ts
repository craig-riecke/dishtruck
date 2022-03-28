import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  GoogleLoginProvider,
  SocialAuthService,
  SocialUser,
} from 'angularx-social-login';
import { firstValueFrom } from 'rxjs';
import { CurrentUserService } from '../services/current-user.service';
import {
  DishtruckLocation,
  LocationService,
} from '../services/location.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  constructor(
    private router: Router,
    private socialAuthService: SocialAuthService,
    private currentUserService: CurrentUserService,
    private locationService: LocationService
  ) {}

  loginWithGoogle(): void {
    let socialUser: SocialUser | null = null;
    this.socialAuthService
      .signIn(GoogleLoginProvider.PROVIDER_ID)
      .then((user) => {
        socialUser = user;
        this.currentUserService.setCurrentUser(socialUser);
        // Lookup their Dishtruck record, if it exists
        return firstValueFrom(this.locationService.getMyMemberRecord());
      })
      .then((dishtruckUser: DishtruckLocation) => {
        this.router.navigate([
          dishtruckUser.type === 'unknown-member' ? 'become-a-member' : 'home',
        ]);
      });
  }

  loginWithApple(): void {
    alert('Sorry, apple login is not supportwed in this demo.');
  }
}
