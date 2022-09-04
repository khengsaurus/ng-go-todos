import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { merge, Observable, of } from 'rxjs';
import { map, share, switchMap } from 'rxjs/operators';
import { ITodo } from 'src/types';
import { UserService } from '.';
import { GET_TODOS, IGET_TODOS } from './queries';

@Injectable({ providedIn: 'root' })
export class TodosService {
  todos: ITodo[];
  todos$: Observable<ITodo[]>;

  constructor(private apollo: Apollo, private userService: UserService) {
    this.todos = [];
    this.todos$ = this.userService.getCurrentUser().pipe(
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
                this.todos = todos;
                return todos;
              })
            );
        } else {
          return of([]);
        }
      }),
      share()
    );
  }

  getCurrentUserTodos() {
    return merge(of(this.todos), this.todos$);
  }
}
