import { Component, OnInit } from '@angular/core';
import { takeWhile, tap } from 'rxjs';
import { TodosService } from 'src/app/services';
import { trackById } from 'src/app/utils';
import { ITodo, Nullable } from 'src/types';

@Component({
  selector: 'todo-cards-page',
  templateUrl: './todos-page.component.html',
  styleUrls: ['./todos-page.component.scss'],
})
export class TodosPage implements OnInit {
  sidenavOpen: boolean = true;
  selectedTodo: Nullable<ITodo> = null;
  private hasAutoSelected = false;

  constructor(public todosService: TodosService) {}

  ngOnInit() {
    this.todosService.currentUserTodos$
      .pipe(
        takeWhile(() => !this.hasAutoSelected),
        tap((todosSub) => {
          if (todosSub?.todos?.length) {
            this.hasAutoSelected = true;
            this.selectTodo(todosSub.todos[0]);
          }
        })
      )
      .subscribe();
  }

  toggleSidenav() {
    this.sidenavOpen = !this.sidenavOpen;
  }

  selectTodo(todo: ITodo) {
    this.selectedTodo = todo;
  }

  handleNewTodo() {
    this.todosService.resetTodoEditor();
    this.selectedTodo = null;
  }

  transform(index: number) {
    return `translateY(${index * 120}%)`;
  }

  trackById = trackById;
}
