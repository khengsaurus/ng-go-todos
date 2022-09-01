import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Route } from 'src/enums';
import { HomePageComponent } from './pages/home-page/home-page.component';

const routes: Routes = [
  { path: Route.HOME, component: HomePageComponent },
  {
    path: Route.USER,
    loadChildren: () =>
      import('./pages/user-page/user.module').then((m) => m.UserModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
