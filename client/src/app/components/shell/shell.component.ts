import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { Route } from 'src/enums';
import { ILink } from '../../../types';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent {
  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService
  ) {}

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.Handset])
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  profileOption: ILink = {
    route: Route.USER_PROFILE,
    label: this.authService.currentUserEmail ? 'Profile' : 'Login',
  };

  sideLinks: Array<ILink | null> = [
    this.profileOption,
    //
  ];
}
