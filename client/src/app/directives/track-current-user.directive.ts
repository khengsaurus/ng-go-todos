import { Directive, OnDestroy, OnInit } from '@angular/core';
import { Subscription, tap } from 'rxjs';
import { IUser, Nullable } from 'src/types';
import { UserService } from '../services';

@Directive({ selector: '[appTrackCurrentUser]' })
export class TrackCurrentUserDirective implements OnInit, OnDestroy {
  currentUser: Nullable<IUser>;
  private currentUserSub: Subscription;

  constructor(public userService: UserService) {
    this.currentUser = null;
    this.currentUserSub = new Subscription();
  }

  ngOnInit(): void {
    this.currentUserSub = this.userService
      .getCurrentUser()
      .pipe(tap((user) => (this.currentUser = user)))
      .subscribe();
  }

  ngOnDestroy(): void {
    this.currentUserSub.unsubscribe();
  }
}
