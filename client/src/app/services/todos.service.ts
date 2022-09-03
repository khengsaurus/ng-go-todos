import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { interval, Observable, of } from 'rxjs';
import { map, share, switchMap, throttle } from 'rxjs/operators';
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
        const userId = user?.id || '';
        if (userId) {
          return this.apollo
            .watchQuery<IGET_TODOS>({
              query: GET_TODOS,
              variables: { userId },
            })
            .valueChanges.pipe(map(({ data }) => data?.getTodos || []));
        } else {
          return of([]);
        }
      }),
      share()
    );
    this.todos$.subscribe();
  }
}
