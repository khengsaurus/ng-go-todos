import { Component, OnInit } from '@angular/core';
import { AuthService, TodosService, UserService } from 'src/app/services';

@Component({
  selector: 'app-home',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePage implements OnInit {
  constructor(
    public authService: AuthService,
    public userService: UserService,
    public todosService: TodosService
  ) {}

  ngOnInit(): void {
    // this.userService.initUsers();
  }
}
