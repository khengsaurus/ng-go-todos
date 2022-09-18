import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { map, share, switchMap, tap } from 'rxjs/operators';
import { IBoard, ITodo } from 'src/types';
import { UserService } from '.';
import {
  CREATE_BOARD,
  DELETE_BOARD,
  GET_BOARDS,
  ICREATE_BOARD,
  IDELETE_BOARD,
  IGET_BOARDS,
} from './queries';

@Injectable({ providedIn: 'root' })
export class BoardsService {
  currentUserBoards$: Subject<IBoard[]>;
  private _boardsCopy: IBoard[] = [];

  constructor(private apollo: Apollo, private userService: UserService) {
    this.currentUserBoards$ = new BehaviorSubject<IBoard[]>([]);
    const _boardsObserver$ = this.userService.currentUser$.pipe(
      switchMap((user) => {
        const userId = user?.id || '';
        if (userId) {
          return this.apollo
            .watchQuery<IGET_BOARDS>({
              query: GET_BOARDS,
              variables: { userId, fresh: true },
            })
            .valueChanges.pipe(
              map(({ data }) => {
                const boards = data?.getBoards || [];
                return boards;
              })
            );
        } else {
          return of([]);
        }
      }),
      tap((boards) => (this._boardsCopy = boards)),
      share()
    );
    _boardsObserver$.subscribe(this.currentUserBoards$);
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
        map((res) => res.data?.deleteBoard),
        tap((deletedBoardId) => {
          if (deletedBoardId === boardId) {
            this.updateBoards(
              this._boardsCopy.filter((board) => board.id !== boardId)
            );
          }
        })
      );
  }

  unshiftTodoToBoard(todo: ITodo, boardId: string) {
    const boardsCopy = [];
    for (const board of this._boardsCopy) {
      if (board.id === boardId) {
        boardsCopy.push({ ...board, todos: [...board.todos, todo] });
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
