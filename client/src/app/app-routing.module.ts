import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DropoffContainersComponent } from './dropoff-containers/dropoff-containers.component';
import { HomeComponent } from './home/home.component';
import { SignoutContainersComponent } from './signout-containers/signout-containers.component';
import { VerifySignoutComponent } from './verify-signout/verify-signout.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  {
    path: 'dropoff-containers/:to_location_id',
    component: DropoffContainersComponent,
  },
  { path: 'signout-containers', component: SignoutContainersComponent },
  { path: 'verify-signout', component: VerifySignoutComponent },
  { path: '**', component: HomeComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
