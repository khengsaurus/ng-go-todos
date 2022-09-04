import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { TodosService } from 'src/app/services';
import { ITodo } from 'src/types';

@Component({
  selector: 'app-todos-page',
  templateUrl: './todos-page.component.html',
  styleUrls: ['./todos-page.component.scss'],
})
export class TodosPage implements OnInit, OnDestroy {
  sidenavOpen: boolean;
  todos$: Observable<ITodo[]>;
  private todosSub: Subscription;

  constructor(private todosService: TodosService) {
    this.sidenavOpen = true;
    this.todosSub = new Subscription();
    this.todos$ = this.todosService.getCurrentUserTodos();
  }

  ngOnInit(): void {
    this.todosSub = this.todos$.subscribe();
  }

  ngOnDestroy(): void {
    this.todosSub.unsubscribe();
  }

  toggleSidenav() {
    this.sidenavOpen = !this.sidenavOpen;
  }
}
