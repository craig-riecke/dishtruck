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

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SignoutContainersComponent,
    VerifySignoutComponent,
    DropoffContainersComponent,
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
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
