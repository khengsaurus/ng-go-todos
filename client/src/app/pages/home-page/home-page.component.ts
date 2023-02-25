import { Component } from '@angular/core';
import { TrackCurrentUserDirective } from 'src/app/directives';
import { UserService } from 'src/app/services';

@Component({
  selector: 'home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePage extends TrackCurrentUserDirective {
  constructor(public override userService: UserService) {
    super(userService);
  }
}
