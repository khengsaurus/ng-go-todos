import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService, UserService } from 'src/app/services';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss'],
})
export class ProfilePage {
  constructor(
    public afAuth: AngularFireAuth,
    public authService: AuthService,
    public userService: UserService
  ) {}
}
