import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { LocationComponent } from './location/location.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  {
    path: 'location/:id',
    component: LocationComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'location/:id/invoice/:from/:to',
    component: InvoiceComponent,
    canActivate: [AuthGuard],
  },
  { path: 'login', component: LoginComponent },
  { path: '**', component: DashboardComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
