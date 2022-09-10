import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
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
  DELETE_TODO,
  IDELETE_TODO,
} from './queries';

@Injectable({ providedIn: 'root' })
export class TodosService {
  currentUserTodos$: Subject<ITodo[]>;
  // Hacky way to update subject value https://stackoverflow.com/questions/51037295/
  _todosCopy: ITodo[] = [];

  constructor(private apollo: Apollo, private userService: UserService) {
    this.currentUserTodos$ = new BehaviorSubject<ITodo[]>([]);
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
      tap((todos) => (this._todosCopy = todos)),
      share()
    );
    _todosObserver$.subscribe(this.currentUserTodos$);
  }

  getcurrentUserTodos$(userId?: string) {
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
        map((res) => res.data?.createTodo),
        tap((_newTodo) => {
          if (_newTodo) {
            this.updateTodos([_newTodo, ...this._todosCopy]);
          }
        })
      );
  }

  updateTodo$(todo: ITodo) {
    return this.apollo
      .mutate<IUPDATE_TODO>({
        mutation: UPDATE_TODO,
        variables: { updateTodo: todo },
        optimisticResponse: { updateTodo: todo },
      })
      .pipe(
        tap((res) => {
          const updatedTodo = res.data?.updateTodo;
          if (updatedTodo) {
            const __todosCopy = [...this._todosCopy];
            for (let i = 0; i < __todosCopy?.length; i++) {
              if (__todosCopy[i].id === updatedTodo.id) {
                __todosCopy[i] = updatedTodo;
                break;
              }
            }
            this.updateTodos(__todosCopy);
          }
        })
      );
  }

  deleteTodo$(userId: string, todoId: string) {
    return this.apollo
      .mutate<IDELETE_TODO>({
        mutation: DELETE_TODO,
        variables: { userId, todoId },
      })
      .pipe(
        map((res) => res.data?.deleteTodo),
        map((deletedTodoId) => {
          if (deletedTodoId === todoId) {
            this.updateTodos(
              this._todosCopy.filter((todo) => todo.id !== todoId)
            );
            return true;
          }
          throw new Error('Failed to delete');
        })
      );
  }

  private updateTodos(todos: ITodo[]) {
    this._todosCopy = todos;
    this.currentUserTodos$.next(todos);
  }
}
