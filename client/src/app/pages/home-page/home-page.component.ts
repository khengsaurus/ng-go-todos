import { Component } from '@angular/core';
import { TrackCurrentUserDirective } from 'src/app/directives/track-current-user.directive';
import { UserService } from 'src/app/services';

@Component({
  selector: 'app-home',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePage extends TrackCurrentUserDirective {
  constructor(public override userService: UserService) {
    super(userService);
  }
}
