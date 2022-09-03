import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AuthService } from 'src/app/services';
import { Route } from 'src/enums';
import { ILink, Nullable } from 'src/types';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent {
  sideLinks: Array<ILink>;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService
  ) {
    this.sideLinks = sideLinksLoggedOut;
    this.authService.currentFbUser$.subscribe((user) => {
      this.sideLinks = user?.email ? sideLinksLoggedIn : sideLinksLoggedOut;
    });
  }

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.Handset])
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );
}

const sideLinksLoggedIn: Array<ILink> = [
  {
    route: Route.USER_PROFILE,
    label: 'Profile',
  },
  {
    route: Route.TODOS,
    label: 'Todos',
  },
];

const sideLinksLoggedOut: Array<ILink> = [
  {
    route: Route.USER_PROFILE,
    label: 'Login',
  },
];
