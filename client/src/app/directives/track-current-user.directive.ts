import { Directive, OnDestroy, OnInit } from '@angular/core';
import { Subscription, tap } from 'rxjs';
import { IUser, Nullable } from 'src/types';
import { UserService } from '../services';

@Directive({ selector: '[appTrackCurrentUser]' })
export class TrackCurrentUserDirective implements OnInit, OnDestroy {
  currentUser: Nullable<IUser> = null;
  private userSub: Nullable<Subscription> = null;

  constructor(public userService: UserService) {}

  ngOnInit(): void {
    this.userSub = this.userService.currentUser$
      .pipe(tap((user) => (this.currentUser = user)))
      .subscribe();
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }
}
