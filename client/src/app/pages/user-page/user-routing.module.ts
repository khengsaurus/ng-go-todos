import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Route } from 'src/enums';
import { ProfilePage } from './profile-page/profile-page.component';

const routes: Routes = [
  { path: '', component: ProfilePage },
  { path: Route.PROFILE, component: ProfilePage },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserRoutingModule {}
