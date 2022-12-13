import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Apollo, MutationResult } from 'apollo-angular';
import { BehaviorSubject, firstValueFrom, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, map, tap } from 'rxjs/operators';
import { NewBoardDialog } from 'src/app/components/dialogs';
import { IBoard, ITodo, IUser, Nullable } from 'src/types';
import { TodosService, UserService } from '.';
import {
  ADD_RM_BOARD_TODO,
  CREATE_BOARD,
  DELETE_BOARD,
  GET_BOARDS,
  IADD_RM_BOARD_TODO,
  ICREATE_BOARD,
  IDELETE_BOARD,
  IGET_BOARDS,
  IMOVE_TODOS,
  ISHIFT_TODO_BETWEEN_BOARDS,
  MOVE_TODOS,
  SHIFT_TODO_BETWEEN_BOARDS,
} from './queries';

@Injectable({ providedIn: 'root' })
export class BoardsService {
  currentUserBoards$: Subject<IBoard[]>;
  private _boardsCopy: IBoard[] = [];

  constructor(
    private apollo: Apollo,
    private userService: UserService,
    private todosService: TodosService,
    private dialog: MatDialog
  ) {
    this.currentUserBoards$ = new BehaviorSubject<IBoard[]>([]);
    const _boardsObserver$ = this.userService.currentUser$.pipe(
      // to prevent getBoards being called multiple times and updating state with outdated data 🤷‍♂️
      distinctUntilChanged((prev, curr) => prev?.id === curr?.id),
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

  deleteBoard$(userId: string, boardId: string) {
    return this.apollo
      .mutate<IDELETE_BOARD>({
        mutation: DELETE_BOARD,
        variables: { userId, boardId },
      })
      .pipe(
        tap((res) => {
          if (res.data?.deleteBoard) {
            this.updateBoards(this._boardsCopy.filter((b) => b.id !== boardId));
            this.todosService.screen((todo) =>
              todo.boardId === boardId ? { ...todo, boardId: '' } : todo
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
  ): Observable<MutationResult<IADD_RM_BOARD_TODO>> {
    return this.apollo
      .mutate<IADD_RM_BOARD_TODO>({
        mutation: ADD_RM_BOARD_TODO,
        variables: {
          userId: this.userService.currentUser?.id,
          todoId: todo.id,
          boardId,
          rm: false,
        },
        optimisticResponse: { addRmBoardTodo: true },
      })
      .pipe(
        tap((res) => {
          if (res?.data?.addRmBoardTodo) this.addRmTodoOnBoard(todo, boardId);
        })
      );
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

  rmTodoFromBoards(todo: ITodo) {
    const boards = [...this._boardsCopy];
    for (const board of boards) {
      if (board.todos?.some((t) => t.id === todo.id)) {
        board.todos = board.todos.filter((t) => t.id !== todo.id);
        this.currentUserBoards$.next(boards);
        break;
      }
    }
  }

  private updateBoards(boards: IBoard[]) {
    this._boardsCopy = boards;
    this.currentUserBoards$.next(boards);
  }
}
