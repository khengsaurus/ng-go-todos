import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { firstValueFrom, Observable, of } from 'rxjs';
import { map, share, switchMap } from 'rxjs/operators';
import { IUser, Nullable } from 'src/types';
import { AuthService } from './auth.service';
import {
  CREATE_USER,
  GET_USER,
  GET_USERS,
  ICREATE_USER,
  IGET_USER,
} from './queries';

@Injectable({ providedIn: 'root' })
export class UserService {
  currentUser$: Observable<Nullable<IUser>>;
  users$: Observable<IUser[]> = of([]);

  constructor(private apollo: Apollo, private authService: AuthService) {
    /**
     * subscribe to currentFbUser$
     * if currentFbUser$
     *   get user doc or create if non exists
     *   set as currentUser
     * else set currentUser as null
     */
    this.currentUser$ = this.authService.currentFbUser$.pipe(
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
      share() // required to 'flatten' async to one output
    );
    this.currentUser$.subscribe();
  }

  createUser(email: string, username = '') {
    return this.apollo.mutate<ICREATE_USER>({
      mutation: CREATE_USER,
      variables: { newUser: { email, username: username || email } },
    });
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

  getUser(email: string) {
    return this.apollo.watchQuery<IGET_USER>({
      query: GET_USER,
      variables: { email },
    }).valueChanges;
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

  initUsers() {
    if (!this.users$) {
      this.users$ = this.apollo
        .watchQuery<{ getUsers: IUser[] }>({ query: GET_USERS })
        .valueChanges.pipe(map(({ data }) => data?.getUsers || []));
    }
  }
}
