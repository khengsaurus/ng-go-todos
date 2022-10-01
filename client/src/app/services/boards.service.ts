import { Injectable } from '@angular/core';
import { Apollo, MutationResult } from 'apollo-angular';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { IBoard, ITodo, IUser, Nullable } from 'src/types';
import { UserService } from '.';
import {
  ADD_TODO_TO_BOARD,
  CREATE_BOARD,
  DELETE_BOARD,
  GET_BOARDS,
  IADD_TODO_TO_BOARD,
  ICREATE_BOARD,
  IDELETE_BOARD,
  IGET_BOARDS,
  IMOVE_TODOS,
  IREMOVE_TODO_FROM_BOARD,
  ISHIFT_TODO_BETWEEN_BOARDS,
  MOVE_TODOS,
  REMOVE_TODO_FROM_BOARD,
  SHIFT_TODO_BETWEEN_BOARDS,
} from './queries';

@Injectable({ providedIn: 'root' })
export class BoardsService {
  currentUserBoards$: Subject<IBoard[]>;
  private _boardsCopy: IBoard[] = [];

  constructor(private apollo: Apollo, private userService: UserService) {
    this.currentUserBoards$ = new BehaviorSubject<IBoard[]>([]);
    const _boardsObserver$ = this.userService.currentUser$.pipe(
      tap((user) => this.getBoards(user))
    );
    _boardsObserver$.subscribe();
  }

  getBoards(user: Nullable<IUser>) {
    const { id = '', boardIds } = user || {};
    if (id && boardIds?.length) {
      this.apollo
        .watchQuery<IGET_BOARDS>({
          query: GET_BOARDS,
          variables: { userId: id, fresh: true },
        })
        .valueChanges.pipe(
          map(({ data }) => data?.getBoards?.boards || []),
          tap((_boards) => {
            if (!_boards.length) return;
            const boards = boardIds
              .map((boardId) => _boards.find((board) => board.id === boardId))
              .filter((board) => board) as IBoard[];
            this.updateBoards(boards);
          })
        )
        .subscribe();
    }
  }

  createBoard$(userId: string, name: string) {
    return this.apollo
      .mutate<ICREATE_BOARD>({
        mutation: CREATE_BOARD,
        variables: { newBoard: { userId, name } },
      })
      .pipe(
        map((res) => res.data?.createBoard),
        tap((_newBoard) => {
          if (_newBoard) {
            this.updateBoards([...this._boardsCopy, _newBoard]);
          }
        })
      );
  }

  deleteBoard$(userId: string, boardId: string) {
    return this.apollo
      .mutate<IDELETE_BOARD>({
        mutation: DELETE_BOARD,
        variables: { userId, boardId },
      })
      .pipe(
        tap((res) => {
          if (res.data?.deleteBoard) {
            this.updateBoards(
              this._boardsCopy.filter((board) => board.id !== boardId)
            );
          }
        })
      );
  }

  moveTodos$(todoIds: string[], boardId: string) {
    return this.apollo.mutate<IMOVE_TODOS>({
      mutation: MOVE_TODOS,
      variables: { userId: this.userService.currentUser?.id, boardId, todoIds },
      optimisticResponse: { moveTodos: true },
    });
  }

  addTodoToBoard$(
    todo: ITodo,
    boardId: string
  ): Observable<MutationResult<IADD_TODO_TO_BOARD>> {
    return this.apollo
      .mutate<IADD_TODO_TO_BOARD>({
        mutation: ADD_TODO_TO_BOARD,
        variables: {
          userId: this.userService.currentUser?.id,
          todoId: todo.id,
          boardId,
        },
        optimisticResponse: { addTodoToBoard: true },
      })
      .pipe(
        tap((res) => {
          if (res?.data?.addTodoToBoard) {
            this.addRmTodoOnBoard(todo, boardId);
          }
        })
      );
  }

  removeTodoFromBoard$(todoId: string, boardId: string) {
    return this.apollo.mutate<IREMOVE_TODO_FROM_BOARD>({
      mutation: REMOVE_TODO_FROM_BOARD,
      variables: { userId: this.userService.currentUser?.id, todoId, boardId },
      optimisticResponse: { removeTodoFromBoard: true },
    });
  }

  shiftTodoBetweenBoards$(
    todo: ITodo,
    fromBoard: string,
    toBoard: string,
    toIndex: number
  ) {
    return this.apollo
      .mutate<ISHIFT_TODO_BETWEEN_BOARDS>({
        mutation: SHIFT_TODO_BETWEEN_BOARDS,
        variables: {
          userId: this.userService.currentUser?.id,
          todoId: todo.id,
          fromBoard,
          toBoard,
          toIndex,
        },
        optimisticResponse: { shiftTodoBetweenBoards: true },
      })
      .pipe(
        tap((res) => {
          if (res?.data?.shiftTodoBetweenBoards) {
            this.addRmTodoOnBoard(todo, fromBoard, false);
            this.addRmTodoOnBoard(todo, toBoard, true, toIndex);
          }
        })
      );
  }

  addRmTodoOnBoard(todo: ITodo, boardId: string, add = true, index = 0) {
    const boardsCopy = [];
    for (const board of this._boardsCopy) {
      if (board.id === boardId) {
        let todos = [];
        if (add) {
          todos = [...board.todos];
          todos.splice(index, 0, todo);
        } else {
          todos = board.todos.filter((t) => t.id !== todo.id);
        }
        boardsCopy.push({ ...board, todos });
      } else {
        boardsCopy.push(board);
      }
    }
    this.updateBoards(boardsCopy);
  }

  private updateBoards(boards: IBoard[]) {
    this._boardsCopy = boards;
    this.currentUserBoards$.next(boards);
  }
}
