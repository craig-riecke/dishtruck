import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';

import { Observable } from 'rxjs';
import { CurrentUserService } from '../services/current-user.service';
import { SocialUser } from 'angularx-social-login';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  jwt: string | null = null;

  constructor(private currentUserService: CurrentUserService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const currentUser: SocialUser | null =
      this.currentUserService.currentUserSnapshot();
    // This probably can't happen because of Guards, but at least the call to Auth provider
    // APIs may not require a JWT
    if (!currentUser) {
      return next.handle(req);
    }
    const headers: any = {
      setHeaders: {
        Authorization: `Bearer ${currentUser.idToken}`,
      },
    };
    const jwtRequest = req.clone(headers);
    return next.handle(jwtRequest);
  }
}
