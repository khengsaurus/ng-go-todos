import { Directive, OnDestroy, OnInit } from '@angular/core';
import { Subscription, tap } from 'rxjs';
import { IUser } from 'src/types';
import { UserService } from '../services';

@Directive({ selector: '[appTrackCurrentUser]' })
export class TrackCurrentUserDirective implements OnInit, OnDestroy {
  currentUser: IUser | null | undefined;
  private userSub: Subscription | undefined;

  constructor(public userService: UserService) {}

  ngOnInit() {
    this.userSub = this.userService.currentUser$
      .pipe(tap((user) => (this.currentUser = user)))
      .subscribe();
  }

  ngOnDestroy() {
    this.userSub?.unsubscribe();
  }
}
