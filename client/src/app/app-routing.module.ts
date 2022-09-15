import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Route } from 'src/enums';
import { BoardsPage } from './pages/boards-page/boards-page.component';
import { HomePage } from './pages/home-page/home-page.component';
import { TodosPage } from './pages/todos-page/todos-page.component';

const routes: Routes = [
  { path: Route.HOME, component: HomePage },
  { path: Route.TODOS, component: TodosPage },
  { path: Route.BOARDS, component: BoardsPage },
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
