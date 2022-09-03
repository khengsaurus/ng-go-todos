import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService, TodosService, UserService } from 'src/app/services';
import { ITodo } from 'src/types';

@Component({
  selector: 'app-home',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePage implements OnInit {
  isLoggedIn = false;
  todos$: Observable<ITodo[]>;

  constructor(
    public authService: AuthService,
    public userService: UserService,
    public todosService: TodosService
  ) {
    this.todos$ = new Observable();
  }

  ngOnInit(): void {
    this.userService.initUsers();
  }
}
