import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { map, Observable } from 'rxjs';
import { CurrentUserService } from './services/current-user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private socialAuthService: SocialAuthService,
    private currentUserService: CurrentUserService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.socialAuthService.authState.pipe(
      // We do this for easy debugging because the auth login stays put even when the app reloads
      map((socialUser: SocialUser) => {
        if (socialUser) {
          this.currentUserService.setCurrentUser(socialUser);
          return true;
        } else {
          this.currentUserService.redirectUrl = state.url;
          this.router.navigate(['login']);
          return false;
        }
      })
    );
  }
}
