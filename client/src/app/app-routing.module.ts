import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { DropoffContainersComponent } from './dropoff-containers/dropoff-containers.component';
import { FindDropoffComponent } from './find-dropoff/find-dropoff.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { CheckoutContainersComponent } from './checkout-containers/checkout-containers.component';
import { VerifyCheckoutComponent } from './verify-checkout/verify-checkout.component';
import { BecomeAMemberComponent } from './become-a-member/become-a-member.component';
import { HowItWorksComponent } from './how-it-works/how-it-works.component';
import { SupportComponent } from './support/support.component';

const routes: Routes = [
  {
    path: 'become-a-member',
    component: BecomeAMemberComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'checkout-containers',
    component: CheckoutContainersComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'dropoff-containers/:to_location_id',
    component: DropoffContainersComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'find-dropoff',
    component: FindDropoffComponent,
    canActivate: [AuthGuard],
  },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  {
    path: 'how-it-works',
    component: HowItWorksComponent,
    canActivate: [AuthGuard],
  },
  { path: 'login', component: LoginComponent },
  { path: 'support', component: SupportComponent, canActivate: [AuthGuard] },
  {
    path: 'verify-checkout',
    component: VerifyCheckoutComponent,
    canActivate: [AuthGuard],
  },
  { path: '**', component: LoginComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
