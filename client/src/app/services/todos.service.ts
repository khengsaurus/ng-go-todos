import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { interval, Observable } from 'rxjs';
import { map, switchMap, throttle } from 'rxjs/operators';
import { ITodo } from 'src/types';
import { UserService } from '.';
import { GET_TODOS, IGET_TODOS } from './queries';

@Injectable({ providedIn: 'root' })
export class TodosService {
  todos$: Observable<ITodo[]>;

  constructor(private apollo: Apollo, private userService: UserService) {
    this.todos$ = this.userService.currentUser$.pipe(
      throttle(() => interval(500)),
      switchMap((user) => {
        const email = user?.email || '';
        if (email) {
          return this.apollo
            .watchQuery<IGET_TODOS>({
              query: GET_TODOS,
              variables: { email },
            })
            .valueChanges.pipe(map(({ data }) => data?.getTodos || []));
        } else {
          return [];
        }
      })
    );
    this.todos$.subscribe();
  }
}
