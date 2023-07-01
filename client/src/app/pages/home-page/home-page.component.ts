import { Component } from '@angular/core';
import { TrackCurrentUserDirective } from 'src/app/directives';
import { UserService } from 'src/app/services';
import { Route } from 'src/enums';
import { ILink } from 'src/types';

@Component({
  selector: 'home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePage extends TrackCurrentUserDirective {
  sideLinks: Array<ILink>;

  constructor(public override userService: UserService) {
    super(userService);
    this.sideLinks = [
      { label: 'Todos', route: Route.TODOS },
      { label: 'Kanban', route: Route.BOARDS },
    ];
  }
}
