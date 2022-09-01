import { Injectable } from '@angular/core';
import { Apollo, MutationResult } from 'apollo-angular';
import { firstValueFrom, Observable } from 'rxjs';
import { IUser } from 'src/types';
import { CREATE_USER, GET_USER, GET_USERS } from './queries';

@Injectable({ providedIn: 'root' })
export class GQLService {
  private usersSubscription: Observable<any> | undefined;

  constructor(private apollo: Apollo) {}

  createUser(email: string, username = '') {
    return firstValueFrom(
      this.apollo.mutate({
        mutation: CREATE_USER,
        variables: { newUser: { email, username: username || email } },
      }) as Observable<MutationResult<{ createUser: IUser }>>
    );
  }

  getUser(email: string) {
    return new Promise((resolve) => {
      firstValueFrom(
        this.apollo.query({
          query: GET_USER,
          variables: { email },
        })
      )
        .then(resolve)
        .catch((err) => {
          if (err?.message !== 'mongo: no documents in result')
            console.error(err);
          resolve(null);
        });
    });
  }

  getUsers() {
    if (this.usersSubscription) return this.usersSubscription;
    const obs = this.apollo.watchQuery({ query: GET_USERS }).valueChanges;
    this.usersSubscription = obs;
    return obs;
  }
}
