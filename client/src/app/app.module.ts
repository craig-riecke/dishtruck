import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { HttpClientModule } from '@angular/common/http';
import { SignoutContainersComponent } from './signout-containers/signout-containers.component';
import { ReactiveFormsModule } from '@angular/forms';
import { VerifySignoutComponent } from './verify-signout/verify-signout.component';
import { DropoffContainersComponent } from './dropoff-containers/dropoff-containers.component';
import { FindDropoffComponent } from './find-dropoff/find-dropoff.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { GoogleLoginProvider, SocialLoginModule } from 'angularx-social-login';
import { AuthGuard } from './auth.guard';
import { LoginComponent } from './login/login.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SignoutContainersComponent,
    VerifySignoutComponent,
    DropoffContainersComponent,
    FindDropoffComponent,
    LoginComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatButtonModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressBarModule,
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
            provider: new GoogleLoginProvider(
              '952379108326-ct5jshq38p20tr910lnkh57c0hdqqf75.apps.googleusercontent.com'
            ), // your client id
          },
        ],
      },
    },
    AuthGuard,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
