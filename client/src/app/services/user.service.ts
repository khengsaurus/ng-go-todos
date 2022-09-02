import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { firstValueFrom, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { IUser } from 'src/types';
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
  currentUser: IUser | undefined = undefined;
  users$: Observable<IUser[]> | undefined = undefined;

  constructor(private apollo: Apollo, private authService: AuthService) {
    /**
     * To-be flow:
     * - subscribe to currentUserEmail$
     * - if currentUserEmail$
     *     get user doc or create if non exists
     *     set as currentUser
     * - else set currentUser as undefined
     */
    this.authService.currentUserEmail$
      .pipe(
        tap(async (email) => {
          if (email) {
            await this.getUserPromise(email).then(async (user) => {
              const _user = user || (await this.createUserPromise(email));
              this.currentUser = _user;
            });
          } else {
            this.currentUser = undefined;
          }
        })
      )
      .subscribe();
  }

  createUser(email: string, username = '') {
    return this.apollo.mutate<ICREATE_USER>({
      mutation: CREATE_USER,
      variables: { newUser: { email, username: username || email } },
    });
  }

  createUserPromise(email: string, username = ''): Promise<IUser | undefined> {
    console.log('-> createUserPromise');
    return new Promise((resolve) => {
      firstValueFrom(
        this.apollo.mutate<ICREATE_USER>({
          mutation: CREATE_USER,
          variables: { newUser: { email, username: username || email } },
        })
      )
        .then((res) => resolve(res?.data?.createUser || undefined))
        .catch((err) => {
          console.error(err);
          resolve(undefined);
        });
    });
  }

  getUser(email: string) {
    return this.apollo.watchQuery<IGET_USER>({
      query: GET_USER,
      variables: { email },
    }).valueChanges;
  }

  getUserPromise(email: string): Promise<IUser | undefined> {
    console.log('-> getUserPromise');
    return new Promise((resolve) => {
      firstValueFrom(
        this.apollo.query<IGET_USER>({
          query: GET_USER,
          variables: { email },
        })
      )
        .then((res) => resolve(res?.data?.getUser || undefined))
        .catch((err) => {
          if (err?.message !== 'mongo: no documents in result')
            console.error(err);
          resolve(undefined);
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
