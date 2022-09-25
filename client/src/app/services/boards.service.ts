import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { IBoard, ITodo } from 'src/types';
import { UserService } from '.';
import {
  CREATE_BOARD,
  DELETE_BOARD,
  GET_BOARDS,
  ICREATE_BOARD,
  IDELETE_BOARD,
  IGET_BOARDS,
  IMOVE_TODOS,
  MOVE_TODOS,
} from './queries';

@Injectable({ providedIn: 'root' })
export class BoardsService {
  currentUserBoards$: Subject<IBoard[]>;
  private _boardsCopy: IBoard[] = [];

  constructor(private apollo: Apollo, private userService: UserService) {
    this.currentUserBoards$ = new BehaviorSubject<IBoard[]>([]);
    let boardIds: string[] = [];
    const _boardsObserver$ = this.userService.currentUser$.pipe(
      switchMap((user) => {
        const userId = user?.id || '';
        boardIds = user?.boardIds || [];
        if (userId) {
          return this.apollo
            .watchQuery<IGET_BOARDS>({
              query: GET_BOARDS,
              variables: { userId, fresh: true },
            })
            .valueChanges.pipe(
              map(({ data }) => data?.getBoards?.boards || [])
            );
        } else {
          return of([]);
        }
      }),
      tap((_boards) => {
        if (!_boards.length) return;
        const boards = boardIds
          .map((boardId) => _boards.find((board) => board.id === boardId))
          .filter((board) => board) as IBoard[];
        this.updateBoards(boards);
      })
    );
    _boardsObserver$.subscribe();
  }

  createBoard$(userId: string, name: string) {
    const newBoard = { userId, name, todoIds: [] };
    return this.apollo
      .mutate<ICREATE_BOARD>({
        mutation: CREATE_BOARD,
        variables: { newBoard },
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
      variables: { todoIds, boardId },
      optimisticResponse: { moveTodos: true },
    });
  }

  unshiftTodoToBoard(todo: ITodo, boardId: string) {
    const boardsCopy = [];
    for (const board of this._boardsCopy) {
      if (board.id === boardId) {
        boardsCopy.push({ ...board, todos: [todo, ...board.todos] });
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
