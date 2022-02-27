import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { DropoffContainersComponent } from './dropoff-containers/dropoff-containers.component';
import { FindDropoffComponent } from './find-dropoff/find-dropoff.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { SignoutContainersComponent } from './signout-containers/signout-containers.component';
import { VerifySignoutComponent } from './verify-signout/verify-signout.component';

const routes: Routes = [
  {
    path: 'dropoff-containers/:to_location_id',
    component: DropoffContainersComponent,
  },
  {
    path: 'find-dropoff',
    component: FindDropoffComponent,
    canActivate: [AuthGuard],
  },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  {
    path: 'signout-containers',
    component: SignoutContainersComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'verify-signout',
    component: VerifySignoutComponent,
    canActivate: [AuthGuard],
  },
  { path: '**', component: LoginComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
