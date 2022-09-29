import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, tap } from 'rxjs';
import { TodosService } from 'src/app/services';
import { ITodo, Nullable } from 'src/types';

@Component({
  selector: 'todo-cards-page',
  templateUrl: './todos-page.component.html',
  styleUrls: ['./todos-page.component.scss'],
})
export class TodosPage implements OnInit, OnDestroy {
  sidenavOpen: boolean = true;
  selectedTodo: Nullable<ITodo> = null;
  private userTodosSub: Nullable<Subscription> = null;

  constructor(public todosService: TodosService) {}

  ngOnInit() {
    this.userTodosSub = this.todosService.currentUserTodos$
      // Dev: auto select first todo
      .pipe(
        tap((todosSub) => {
          if (todosSub?.todos?.length) {
            this.selectTodo(todosSub.todos[0]);
          }
        })
      )
      // .pipe(
      //   takeWhile((todosSub) => todosSub.updated > this.lastUpdated),
      //   tap((todosSub) => {
      //     this.lastUpdated = todosSub.updated;
      //     this.todos = todosSub.todos;
      //   })
      // )
      .subscribe();
  }

  ngOnDestroy() {
    this.userTodosSub?.unsubscribe();
  }

  toggleSidenav() {
    this.sidenavOpen = !this.sidenavOpen;
  }

  selectTodo(todo: ITodo) {
    this.selectedTodo = todo;
  }

  trackById(_: number, item: Nullable<ITodo>) {
    return item?.id;
  }

  transform(index: number) {
    return `translateY(${index * 120}%)`;
  }
}
