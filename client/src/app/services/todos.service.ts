import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { ITodo } from 'src/types';
import { UserService } from '.';
import {
  ADD_TODO_TO_BOARD,
  CREATE_TODO,
  DELETE_TODO,
  GET_TODOS,
  IADD_TODO_TO_BOARD,
  ICREATE_TODO,
  IDELETE_TODO,
  IGET_TODOS,
  IUPDATE_TODO,
  UPDATE_TODO,
} from './queries';

interface ITodosSubject {
  todos: ITodo[];
  updated: number;
}

@Injectable({ providedIn: 'root' })
export class TodosService {
  currentUserTodos$: Subject<ITodosSubject>;
  // Hacky way to update subject value https://stackoverflow.com/questions/51037295/
  _todosCopy: ITodo[] = [];

  constructor(private apollo: Apollo, private userService: UserService) {
    this.currentUserTodos$ = new BehaviorSubject<ITodosSubject>({
      todos: [],
      updated: Date.now().valueOf(),
    });
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
                return {
                  todos: data?.getTodos || [],
                  updated: Date.now().valueOf(),
                };
              })
            );
        } else {
          return of({
            todos: [],
            updated: Date.now().valueOf(),
          });
        }
      }),
      tap((todosSub) => (this._todosCopy = todosSub.todos))
    );
    _todosObserver$.subscribe(this.currentUserTodos$);
  }

  createTodo$(userId: string, text: string) {
    const newTodo = { userId, text };
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

  updateTodo$(updateTodo: Partial<ITodo>) {
    return this.apollo
      .mutate<IUPDATE_TODO>({
        mutation: UPDATE_TODO,
        variables: { updateTodo },
        optimisticResponse: { updateTodo: updateTodo.id || '' },
      })
      .pipe(
        tap((res) => {
          const updatedTodoId = res.data?.updateTodo;
          if (updatedTodoId === updateTodo.id) {
            let __todosCopy = [...this._todosCopy];
            if (updateTodo.text) {
              // unshift if text changed
              let _updatedTodo: ITodo;
              for (let i = 0; i < __todosCopy.length; i++) {
                if (__todosCopy[i].id === updateTodo.id) {
                  _updatedTodo = {
                    ...__todosCopy.splice(i, 1)[0],
                    ...updateTodo,
                  };
                  break;
                }
              }
              __todosCopy.unshift(_updatedTodo!);
            } else {
              for (let i = 0; i < __todosCopy.length; i++) {
                if (__todosCopy[i].id === updateTodo.id) {
                  __todosCopy[i] = { ...__todosCopy[i], ...updateTodo };
                  break;
                }
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
          throw new Error('Failed to delete todo');
        })
      );
  }

  addTodoToBoard$(todoId: string, boardId: string) {
    return this.apollo.mutate<IADD_TODO_TO_BOARD>({
      mutation: ADD_TODO_TO_BOARD,
      variables: { todoId, boardId },
    });
  }

  private updateTodos(todos: ITodo[]) {
    this._todosCopy = todos;
    this.currentUserTodos$.next({
      todos,
      updated: Date.now().valueOf(),
    });
  }
}
