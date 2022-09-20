import { Injectable } from '@angular/core';
import { Apollo, MutationResult } from 'apollo-angular';
import { BehaviorSubject, firstValueFrom, Observable, of, Subject } from 'rxjs';
import { map, share, switchMap, tap } from 'rxjs/operators';
import { IUser, Nullable } from 'src/types';
import { AuthService } from './auth.service';
import {
  CREATE_USER,
  GET_USER,
  ICREATE_USER,
  IGET_USER,
  IMOVE_BOARDS,
  MOVE_BOARDS,
} from './queries';

@Injectable({ providedIn: 'root' })
export class UserService {
  currentUser: Nullable<IUser> = null;
  currentUser$: Subject<Nullable<IUser>>;

  constructor(private apollo: Apollo, private authService: AuthService) {
    this.currentUser$ = new BehaviorSubject<Nullable<IUser>>(null);
    const _userObserver$ = this.authService.currentFbUser$.pipe(
      map((firebaseUser) => firebaseUser?.email || ''),
      switchMap(async (email) => {
        let user: Nullable<IUser> = null;
        if (email) {
          user = await this.getUserPromise(email);
          if (user?.email !== email) {
            user = await this.createUserPromise(email);
          }
        }
        return user;
      }),
      tap((user) => (this.currentUser = user)),
      share() // required to 'flatten' async to one output
    );
    _userObserver$.subscribe(this.currentUser$);
  }

  createUserPromise(email: string, username = ''): Promise<Nullable<IUser>> {
    return new Promise((resolve) => {
      firstValueFrom(
        this.apollo.mutate<ICREATE_USER>({
          mutation: CREATE_USER,
          variables: { newUser: { email, username: username || email } },
        })
      )
        .then((res) => resolve(res?.data?.createUser || null))
        .catch((err) => {
          console.error(err);
          resolve(null);
        });
    });
  }

  getUserPromise(email: string): Promise<Nullable<IUser>> {
    return new Promise((resolve) => {
      firstValueFrom(
        this.apollo.query<IGET_USER>({
          query: GET_USER,
          variables: { email },
        })
      )
        .then((res) => resolve(res?.data?.getUser || null))
        .catch((err) => {
          if (err?.message !== 'mongo: no documents in result')
            console.error(err);
          resolve(null);
        });
    });
  }

  getUser$(email: string) {
    return this.apollo.watchQuery<IGET_USER>({
      query: GET_USER,
      variables: { email },
    }).valueChanges;
  }

  moveBoards$(boardIds: string[]): Observable<MutationResult<IMOVE_BOARDS>> {
    return this.currentUser?.id
      ? this.apollo
          .mutate<IMOVE_BOARDS>({
            mutation: MOVE_BOARDS,
            variables: {
              userId: this.currentUser.id,
              boardIds,
            },
            optimisticResponse: { moveBoards: true },
          })
          .pipe(
            tap((res) => {
              if (res.data?.moveBoards) this.updateBoardIds(boardIds);
            })
          )
      : of({ data: { moveBoards: false }, loading: false });
  }

  updateBoardIds(boardIds: string[]) {
    if (!this.currentUser?.boardIds) return;
    this.currentUser = { ...this.currentUser, boardIds };
  }
}
