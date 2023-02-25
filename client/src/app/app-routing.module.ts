import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Route } from 'src/enums';
import { BoardsPage, HomePage, TodosPage } from './pages';

const routes: Routes = [
  { path: Route.HOME, component: HomePage },
  {
    path: Route.TODOS,
    component: TodosPage,
    // canActivate: [AuthGuard]
  },
  {
    path: Route.BOARDS,
    component: BoardsPage,
    // canActivate: [AuthGuard]
  },
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
