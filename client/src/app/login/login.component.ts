import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { filter, tap, switchMap } from 'rxjs';
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
  loading: boolean = false;

  constructor(
    private router: Router,
    private socialAuthService: SocialAuthService,
    private currentUserService: CurrentUserService,
    private locationService: LocationService
  ) {}

  ngOnInit() {
    this.socialAuthService.authState
      .pipe(
        // Just ignore logouts
        filter((socialUser: SocialUser) => !!socialUser),
        // Save Google information in service so others can get to it
        tap((socialUser: SocialUser) => {
          this.currentUserService.setCurrentUser(socialUser);
          this.loading = true;
        }),
        // Get member record information from our functions, if it exists.  This sends the
        // user information as a JWT
        switchMap(() => this.locationService.getMyMemberRecord())
      )
      .subscribe((dishtruckUser: DishtruckLocation | null) => {
        this.loading = false;
        let redirectUrl = 'home';
        if (!dishtruckUser) {
          redirectUrl = 'become-a-member';
        } else if (this.currentUserService.redirectUrl) {
          redirectUrl = this.currentUserService.redirectUrl;
        }
        this.router.navigateByUrl(redirectUrl);
      });
  }
}
