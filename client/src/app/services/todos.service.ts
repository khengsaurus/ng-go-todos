import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ITodo } from 'src/types';
import { GET_TODOS, IGET_TODOS } from './queries';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private userId: string;
  todos$: Observable<ITodo[]> | undefined;

  constructor(private apollo: Apollo) {
    this.userId = '';
    this.todos$ = undefined;
  }

  initTodos(userId?: string) {
    if (userId === this.userId && !this.todos$) return;
    if (userId) {
      this.userId = userId;
      this.todos$ = this.apollo
        .watchQuery<IGET_TODOS>({
          query: GET_TODOS,
          variables: { userId },
        })
        .valueChanges.pipe(map(({ data }) => data?.getTodos || []));
    } else {
      this.todos$ = undefined;
    }
  }
}
