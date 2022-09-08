import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { BehaviorSubject, firstValueFrom, Subject } from 'rxjs';
import { map, share, switchMap, tap } from 'rxjs/operators';
import { IUser, Nullable } from 'src/types';
import { AuthService } from './auth.service';
import { CREATE_USER, GET_USER, ICREATE_USER, IGET_USER } from './queries';

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
          if (!user || user?.email !== email) {
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
}
