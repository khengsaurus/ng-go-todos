import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription, switchMap } from 'rxjs';
import { TodosService, UserService } from 'src/app/services';
import { ITodo } from 'src/types';

@Component({
  selector: 'app-todos-page',
  templateUrl: './todos-page.component.html',
  styleUrls: ['./todos-page.component.scss'],
})
export class TodosPage implements OnInit, OnDestroy {
  currentUserTodos$: Observable<ITodo[]>;
  sidenavOpen: boolean;
  private _userTodosSub: Subscription;

  constructor(
    private todosService: TodosService,
    private userService: UserService
  ) {
    this.sidenavOpen = true;
    this._userTodosSub = new Subscription();
    this.currentUserTodos$ = this.userService.currentUser$.pipe(
      switchMap((user) => this.todosService.getTodos$(user?.id))
    );
  }

  ngOnInit(): void {
    this._userTodosSub = this.currentUserTodos$.subscribe();
  }

  ngOnDestroy(): void {
    this._userTodosSub.unsubscribe();
  }

  toggleSidenav() {
    this.sidenavOpen = !this.sidenavOpen;
  }
}
