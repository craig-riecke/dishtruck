import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatStepperModule } from '@angular/material/stepper';
import { MatToolbarModule } from '@angular/material/toolbar';

import { HttpClientModule } from '@angular/common/http';
import { CheckoutContainersComponent } from './checkout-containers/checkout-containers.component';
import { ReactiveFormsModule } from '@angular/forms';
import { VerifyCheckoutComponent } from './verify-checkout/verify-checkout.component';
import { DropoffContainersComponent } from './dropoff-containers/dropoff-containers.component';
import { FindDropoffComponent } from './find-dropoff/find-dropoff.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import {
  GoogleLoginProvider,
  SocialAuthServiceConfig,
  SocialLoginModule,
} from '@abacritt/angularx-social-login';
import { AuthGuard } from './auth.guard';
import { LoginComponent } from './login/login.component';
import { customInterceptorProviders } from './custom-interceptors/index';
import { BecomeAMemberComponent } from './become-a-member/become-a-member.component';
import { HowItWorksComponent } from './how-it-works/how-it-works.component';
import { SupportComponent } from './support/support.component';
import * as Sentry from '@sentry/angular';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    CheckoutContainersComponent,
    VerifyCheckoutComponent,
    DropoffContainersComponent,
    FindDropoffComponent,
    LoginComponent,
    BecomeAMemberComponent,
    HowItWorksComponent,
    SupportComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatExpansionModule,
    MatIconModule,
    MatListModule,
    MatProgressBarModule,
    MatSidenavModule,
    MatStepperModule,
    MatToolbarModule,
    ReactiveFormsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
    SocialLoginModule,
  ],
  providers: [
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: true, //keeps the user signed in
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(environment.OAUTH2_CLIENT_ID), // your client id
          },
        ],
        onError: (err: any) => {
          console.error(err);
        },
      } as SocialAuthServiceConfig,
    },
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({ showDialog: true }),
    },
    AuthGuard,
    customInterceptorProviders,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
