import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { map, share, switchMap, tap } from 'rxjs/operators';
import { ITodo } from 'src/types';
import { UserService } from '.';
import {
  GET_TODOS,
  IUPDATE_TODO,
  IGET_TODOS,
  UPDATE_TODO,
  ICREATE_TODO,
  CREATE_TODO,
} from './queries';

@Injectable({ providedIn: 'root' })
export class TodosService {
  todos$: Subject<ITodo[]>;
  // Hacky way to update subject value https://stackoverflow.com/questions/51037295/
  _todoCopy: ITodo[] = [];

  constructor(private apollo: Apollo, private userService: UserService) {
    this.todos$ = new BehaviorSubject<ITodo[]>([]);
    const _todosObserver$ = this.userService.currentUser$.pipe(
      switchMap((user) => {
        const userId = user?.id || '';
        if (userId) {
          return this.apollo
            .watchQuery<IGET_TODOS>({
              query: GET_TODOS,
              variables: { userId, fresh: true },
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
      tap((todos) => (this._todoCopy = todos)),
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
      .valueChanges.pipe(map(({ data }) => data?.getTodos || []));
  }

  createTodo$(text: string, userId: string) {
    const newTodo = { userId, text, tag: 'white', priority: 2 };
    return this.apollo
      .mutate<ICREATE_TODO>({
        mutation: CREATE_TODO,
        variables: { newTodo },
      })
      .pipe(
        tap((res) => {
          const todo = res.data?.createTodo;
          if (todo) {
            const __todoCopy = [todo, ...this._todoCopy];
            this.todos$.next(__todoCopy);
            this._todoCopy = __todoCopy;
          }
        })
      );
  }

  updateTodo$(todo: ITodo) {
    return this.apollo
      .mutate<IUPDATE_TODO>({
        mutation: UPDATE_TODO,
        variables: { updateTodo: todo },
        optimisticResponse: {
          updateTodo: todo,
        },
      })
      .pipe(
        tap((res) => {
          const updatedTodo = res.data?.updateTodo;
          if (updatedTodo) {
            const __todoCopy = [...this._todoCopy];
            for (let i = 0; i < __todoCopy?.length; i++) {
              if (__todoCopy[i].id === updatedTodo.id) {
                __todoCopy[i] = updatedTodo;
                break;
              }
            }
            this._todoCopy = __todoCopy;
            this.todos$.next(__todoCopy);
          }
        })
      );
  }
}
