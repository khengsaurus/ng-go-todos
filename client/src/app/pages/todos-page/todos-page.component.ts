import { Component, OnInit } from '@angular/core';
import { takeWhile, tap } from 'rxjs';
import { TodosService } from 'src/app/services';
import { trackById } from 'src/app/utils';

@Component({
  selector: 'todo-cards-page',
  templateUrl: './todos-page.component.html',
  styleUrls: ['./todos-page.component.scss'],
})
export class TodosPage implements OnInit {
  sidenavOpen: boolean = true;
  private hasAutoSelected = false;

  constructor(public todosService: TodosService) {}

  ngOnInit() {
    this.todosService.currentUserTodos$
      .pipe(
        takeWhile(() => !this.hasAutoSelected),
        tap((todosSub) => {
          if (todosSub?.todos?.length) {
            this.hasAutoSelected = true;
            this.todosService.selectTodo(todosSub.todos[0]);
          }
        })
      )
      .subscribe();
  }

  toggleSidenav() {
    this.sidenavOpen = !this.sidenavOpen;
  }
  handleNewTodo() {
    this.todosService.resetTodoEditor();
    this.todosService.selectTodo(undefined);
  }

  transform(index: number) {
    return `translateY(${index * 120}%)`;
  }

  trackById = trackById;
}
