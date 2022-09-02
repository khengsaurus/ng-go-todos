import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { TodoService } from 'src/app/services/todos.service';
import { UserService } from 'src/app/services/user.service';
import { ITodo } from 'src/types';

@Component({
  selector: 'app-home',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit {
  isLoggedIn = false;
  todos$: Observable<ITodo[]>;

  constructor(
    public authService: AuthService,
    public userService: UserService,
    public todosService: TodoService
  ) {
    this.todos$ = new Observable();
  }

  ngOnInit(): void {
    this.userService.initUsers();
  }
}
