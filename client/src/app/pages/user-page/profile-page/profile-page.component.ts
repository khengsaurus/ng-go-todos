import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Subscription, tap } from 'rxjs';
import { TrackCurrentUserDirective } from 'src/app/directives/track-current-user.directive';
import { AuthService, UserService } from 'src/app/services';
import { IUser, Nullable } from 'src/types';

@Component({
  selector: 'app-profile-page',
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
