import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { map, share, switchMap } from 'rxjs/operators';
import { ITodo } from 'src/types';
import { UserService } from '.';
import { GET_TODOS, IGET_TODOS } from './queries';

@Injectable({ providedIn: 'root' })
export class TodosService {
  todos$: Subject<ITodo[]>;

  constructor(private apollo: Apollo, private userService: UserService) {
    this.todos$ = new BehaviorSubject<ITodo[]>([]);
    const _todosObserver$ = this.userService.currentUser$.pipe(
      switchMap((user) => {
        const userId = user?.id || '';
        if (userId) {
          return this.apollo
            .watchQuery<IGET_TODOS>({
              query: GET_TODOS,
              variables: { userId, fresh: false },
            })
            .valueChanges.pipe(
              map(({ data }) => {
                const todos = data?.getTodos || [];
                return todos;
              })
            );
        } else {
          return of([]);
        }
      }),
      share()
    );
    _todosObserver$.subscribe(this.todos$);
  }

  getTodos$(userId?: string) {
    if (!userId) return of([]);
    return this.apollo
      .watchQuery<IGET_TODOS>({
        query: GET_TODOS,
        variables: { userId, fresh: false },
      })
      .valueChanges.pipe(
        map(({ data }) => {
          const todos = data?.getTodos || [];
          return todos;
        })
      );
  }
}
