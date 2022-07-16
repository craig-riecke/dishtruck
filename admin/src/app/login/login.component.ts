import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { CurrentUserService } from '../services/current-user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  constructor(
    private router: Router,
    private socialAuthService: SocialAuthService,
    private currentUserService: CurrentUserService
  ) {}

  ngOnInit(): void {
    this.socialAuthService.authState.subscribe((socialUser) => {
      console.log('Setting socialUser to ', socialUser);
      this.currentUserService.setCurrentUser(socialUser);
      this.router.navigate(['/']);
    });
  }
}
