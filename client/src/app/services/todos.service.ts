import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { ITodo } from 'src/types';
import { UserService } from '.';
import {
  CREATE_TODO,
  DELETE_TODO,
  GET_TODOS,
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
  resetTodoEditor$: Subject<boolean>;
  // Hacky way to update subject value https://stackoverflow.com/questions/51037295/
  _todosCopy: ITodo[] = [];

  constructor(private apollo: Apollo, private userService: UserService) {
    this.resetTodoEditor$ = new Subject<boolean>();
    this.currentUserTodos$ = new BehaviorSubject<ITodosSubject>({
      todos: [],
      updated: Date.now().valueOf(),
    });
    const _todosObserver$ = this.userService.currentUser$.pipe(
      switchMap((user) => {
        const userId = user?.id || '';
        return userId
          ? this.apollo
              .watchQuery<IGET_TODOS>({
                query: GET_TODOS,
                variables: { userId, fresh: true },
              })
              .valueChanges.pipe(
                map(({ data }) => {
                  return {
                    todos: data?.getTodos?.todos || [],
                    updated: Date.now().valueOf(),
                  };
                })
              )
          : of({
              todos: [],
              updated: Date.now().valueOf(),
            });
      }),
      tap((todosSub) => this.updateTodosSub(todosSub.todos))
    );
    _todosObserver$.subscribe(this.currentUserTodos$);
  }

  resetTodoEditor() {
    this.resetTodoEditor$.next(true);
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
            this.updateTodosSub([_newTodo, ...this._todosCopy]);
          }
        })
      );
  }

  updateTodo$(updateTodo: Partial<ITodo>) {
    return this.apollo
      .mutate<IUPDATE_TODO>({
        mutation: UPDATE_TODO,
        variables: { updateTodo },
        optimisticResponse: { updateTodo: true },
      })
      .pipe(
        tap((res) => {
          if (res.data?.updateTodo) {
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
            this.updateTodosSub(__todosCopy);
          }
        })
      );
  }

  updateTodoInplace(updateTodo: Partial<ITodo>) {
    let __todosCopy = [...this._todosCopy];
    for (let i = 0; i < __todosCopy.length; i++) {
      if (__todosCopy[i].id === updateTodo.id) {
        __todosCopy[i] = { ...__todosCopy[i], ...updateTodo };
        break;
      }
    }
    this.updateTodosSub(__todosCopy);
  }

  deleteTodo$(userId: string, todoId: string) {
    return this.apollo
      .mutate<IDELETE_TODO>({
        mutation: DELETE_TODO,
        variables: { userId, todoId },
      })
      .pipe(
        map((res) => {
          if (res.data?.deleteTodo) {
            this.updateTodosSub(
              this._todosCopy.filter((todo) => todo.id !== todoId)
            );
            return true;
          }
          throw new Error('Failed to delete todo');
        })
      );
  }

  addTodoToBoardCB(todo: ITodo) {
    const todos = [];
    for (const t of this._todosCopy) {
      if (t.id === todo.id) {
        todos.push(todo);
      } else {
        todos.push(t);
      }
    }
    this.updateTodosSub(todos);
  }

  private updateTodosSub(todos: ITodo[]) {
    this._todosCopy = todos;
    this.currentUserTodos$.next({
      todos,
      updated: Date.now().valueOf(),
    });
  }
}
