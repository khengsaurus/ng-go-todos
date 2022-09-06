import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription, switchMap } from 'rxjs';
import { TodosService, UserService } from 'src/app/services';
import { ITodo, Nullable } from 'src/types';

@Component({
  selector: 'app-todos-page',
  templateUrl: './todos-page.component.html',
  styleUrls: ['./todos-page.component.scss'],
})
export class TodosPage implements OnInit, OnDestroy {
  sidenavOpen: boolean;
  selectedTodo: Nullable<ITodo>;
  currentUserTodos$: Observable<ITodo[]>;
  todoText: string;
  private _userTodosSub: Subscription;

  constructor(
    private todosService: TodosService,
    private userService: UserService
  ) {
    this.todoText = '';
    this.sidenavOpen = true;
    this.selectedTodo = null;
    this.currentUserTodos$ = this.userService.currentUser$.pipe(
      switchMap((user) => this.todosService.getTodos$(user?.id))
    );
    this._userTodosSub = new Subscription();
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

  selectTodo(todo: ITodo) {
    this.selectedTodo = todo;
    this.todoText = todo?.text || '';
  }

  updateTodoText(event: Event) {
    this.todoText = (event.target as any)?.value;
    // Save
    // Optimistic update
  }
}
