import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { GET_USERS } from './queries';

@Injectable({ providedIn: 'root' })
export class GQLService {
  private usersSubscription: Observable<any> | undefined;

  constructor(private apollo: Apollo) {}

  users() {
    console.log('-> users called');
    if (this.usersSubscription) return this.usersSubscription;
    const obs = this.apollo.watchQuery({ query: GET_USERS }).valueChanges;
    this.usersSubscription = obs;
    return obs;
  }
}
