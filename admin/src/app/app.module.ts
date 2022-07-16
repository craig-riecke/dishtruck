import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LocationComponent } from './location/location.component';
import { LoginComponent } from './login/login.component';
import {
  GoogleLoginProvider,
  SocialAuthServiceConfig,
  SocialLoginModule,
} from '@abacritt/angularx-social-login';
import { AuthGuard } from './auth.guard';
import { customInterceptorProviders } from './custom-interceptors/index';
import { HttpClientModule } from '@angular/common/http';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { environment } from 'src/environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LocationComponent,
    LoginComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    HttpClientModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSidenavModule,
    MatTableModule,
    MatToolbarModule,
    ReactiveFormsModule,
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
    AuthGuard,
    customInterceptorProviders,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
