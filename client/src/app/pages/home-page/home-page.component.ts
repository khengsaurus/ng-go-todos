import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { GQLService } from 'src/app/services/gql.service';
import { IUser } from 'src/types';

@Component({
  selector: 'app-home',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent {
  isLoggedIn = false;

  constructor(public authService: AuthService) {}

  // ngOnInit(): void {
  //   this.authService.currentUser.subscribe(
  //     (user) => (this.isLoggedIn = Boolean(user))
  //   );
  // }
}
