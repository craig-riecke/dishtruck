import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SignoutContainersComponent } from './signout-containers/signout-containers.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'signout-containers', component: SignoutContainersComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
