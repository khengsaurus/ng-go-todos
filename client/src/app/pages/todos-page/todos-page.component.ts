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
  private userTodosSub: Nullable<Subscription> = null;

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
  }

  ngOnInit(): void {
    this.userTodosSub = this.currentUserTodos$.subscribe();
  }

  ngOnDestroy(): void {
    this.userTodosSub?.unsubscribe();
  }

  toggleSidenav() {
    this.sidenavOpen = !this.sidenavOpen;
  }

  selectTodo(todo: ITodo) {
    this.selectedTodo = todo;
    this.todoText = todo?.text || '';
  }
}
