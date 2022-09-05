import { Directive, OnDestroy, OnInit } from '@angular/core';
import { Subscription, tap } from 'rxjs';
import { IUser, Nullable } from 'src/types';
import { UserService } from '../services';

@Directive({ selector: '[appTrackCurrentUser]' })
export class TrackCurrentUserDirective implements OnInit, OnDestroy {
  currentUser: Nullable<IUser>;
  private _userSub: Subscription;

  constructor(public userService: UserService) {
    this.currentUser = null;
    this._userSub = new Subscription();
  }

  ngOnInit(): void {
    this._userSub = this.userService.currentUser$
      .pipe(tap((user) => (this.currentUser = user)))
      .subscribe();
  }

  ngOnDestroy(): void {
    this._userSub.unsubscribe();
  }
}
