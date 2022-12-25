import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Apollo } from 'apollo-angular';
import { BehaviorSubject, firstValueFrom, Subject } from 'rxjs';
import { distinctUntilChanged, map, tap } from 'rxjs/operators';
import { NewBoardDialog } from 'src/app/components/dialogs';
import { IBoard, ITodo, IUser } from 'src/types';
import { UserService } from '.';
import {
  ADD_RM_BOARD_TODO,
  CREATE_BOARD,
  GET_BOARDS,
  IADD_RM_BOARD_TODO,
  ICREATE_BOARD,
  IGET_BOARDS,
  IMOVE_TODOS,
  IMOVE_TODO_BETWEEN_BOARDS,
  MOVE_TODOS,
  MOVE_TODO_BETWEEN_BOARDS,
} from './queries';

@Injectable({ providedIn: 'root' })
export class BoardsService {
  currentUserBoards$: Subject<IBoard[]>;
  private _boardsCopy: IBoard[] = [];

  constructor(
    private apollo: Apollo,
    private dialog: MatDialog,
    private userService: UserService
  ) {
    this.currentUserBoards$ = new BehaviorSubject<IBoard[]>([]);
    const _boardsObserver$ = this.userService.currentUser$.pipe(
      // to prevent getBoards being called multiple times and updating state with outdated data 🤷‍♂️
      distinctUntilChanged((prev, curr) => prev?.id === curr?.id),
      tap((user) => this.getBoards(user))
    );
    _boardsObserver$.subscribe();
  }

  getBoards(user: IUser | undefined) {
    const { id = '', boardIds } = user || {};
    if (id && boardIds?.length) {
      this.apollo
        .watchQuery<IGET_BOARDS>({
          query: GET_BOARDS,
          variables: { userId: id, fresh: true },
        })
        .valueChanges.pipe(
          map(({ data }) => {
            return { boards: data?.getBoards?.boards || [], userId: id };
          }),
          tap((data) => {
            const boards = boardIds
              .map((boardId) =>
                data.boards.find((board) => board.id === boardId)
              )
              .filter((board) => board) as IBoard[];
            this.updateBoards(boards);
          })
        )
        .subscribe();
    }
  }

  createBoard$(userId: string, name: string, color: string) {
    return this.apollo
      .mutate<ICREATE_BOARD>({
        mutation: CREATE_BOARD,
        variables: { newBoard: { userId, name, color } },
      })
      .pipe(
        map((res) => res.data?.createBoard),
        tap((_newBoard) => {
          if (_newBoard) this.updateBoards([...this._boardsCopy, _newBoard]);
        }),
        map((board) => board?.id)
      );
  }

  openBoardDialog() {
    const dialogRef = this.dialog.open(NewBoardDialog, {
      autoFocus: false,
      width: '244px',
      data: { color: 'gray' },
    });

    return new Promise(async (resolve) => {
      dialogRef.afterClosed().subscribe((input) => {
        if (!input) return resolve(undefined);

        const { name, color } = input;
        if (name && this.userService.currentUser) {
          firstValueFrom(
            this.createBoard$(this.userService.currentUser.id, name, color)
          )
            .then(resolve)
            .catch((err) => {
              console.error(err);
              resolve(undefined);
            });
        } else {
          resolve(undefined);
        }
      });
    });
  }

  moveTodos$(todoIds: string[], boardId: string) {
    return this.apollo.mutate<IMOVE_TODOS>({
      mutation: MOVE_TODOS,
      variables: { userId: this.userService.currentUser?.id, boardId, todoIds },
      optimisticResponse: { moveTodos: true },
    });
  }

  removeTodoFromBoard$(todoId: string, boardId: string) {
    return this.apollo.mutate<IADD_RM_BOARD_TODO>({
      mutation: ADD_RM_BOARD_TODO,
      variables: {
        userId: this.userService.currentUser?.id,
        todoId,
        boardId,
        rm: true,
      },
      optimisticResponse: { addRmBoardTodo: true },
    });
  }

  moveTodoBetweenBoards$(
    todo: ITodo,
    fromBoard: string,
    toBoard: string,
    toIndex: number
  ) {
    return this.apollo
      .mutate<IMOVE_TODO_BETWEEN_BOARDS>({
        mutation: MOVE_TODO_BETWEEN_BOARDS,
        variables: {
          userId: this.userService.currentUser?.id,
          todoId: todo.id,
          fromBoard,
          toBoard,
          toIndex,
        },
        optimisticResponse: { moveTodoBetweenBoards: true },
      })
      .pipe(
        tap((res) => {
          if (res?.data?.moveTodoBetweenBoards) {
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

  rmTodoFromBoards(todo: ITodo) {
    if (!todo.boardId) return;
    const boards = [];
    for (const board of this._boardsCopy) {
      boards.push(
        board.id === todo.boardId
          ? {
              ...board,
              todos: board.todos.filter((t) => t.id !== todo.id),
            }
          : board
      );
    }
    this.currentUserBoards$.next(boards);
  }

  updateBoards(updateVal: IBoard[] | ((board: IBoard) => boolean)) {
    if (Array.isArray(updateVal)) {
      this._boardsCopy = updateVal;
      this.currentUserBoards$.next(updateVal);
    } else {
      const updatedBoards = this._boardsCopy.filter(updateVal);
      this._boardsCopy = updatedBoards;
      this.currentUserBoards$.next(updatedBoards);
    }
  }

  getBoardColor(boardId: string) {
    return boardId ? this._boardsCopy.find((b) => b.id === boardId)?.color : '';
  }
}
