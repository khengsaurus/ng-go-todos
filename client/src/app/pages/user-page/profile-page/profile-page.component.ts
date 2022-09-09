import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { TrackCurrentUserDirective } from 'src/app/directives/track-current-user.directive';
import { AuthService, UserService } from 'src/app/services';

@Component({
  selector: 'profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss'],
})
export class ProfilePage extends TrackCurrentUserDirective {
  constructor(
    public override userService: UserService,
    public afAuth: AngularFireAuth,
    public authService: AuthService
  ) {
    super(userService);
  }
}
