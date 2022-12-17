import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Apollo } from 'apollo-angular';
import { tap } from 'rxjs/operators';
import { ITodo } from 'src/types';
import { BoardsService, TodosService } from '.';
import { SelectBoardDialog } from '../components/dialogs';
import { DELETE_BOARD, IDELETE_BOARD } from './queries';

// Service to cross the 'basic' services, to avoid messy cross-service imports
@Injectable({ providedIn: 'root' })
export class MixedService {
  constructor(
    private apollo: Apollo,
    private boardsService: BoardsService,
    private dialog: MatDialog,
    private todosService: TodosService
  ) {}

  moveTodoToBoard(todo?: ITodo) {
    if (!todo) return;
    const dialogRef = this.dialog.open(SelectBoardDialog, {
      autoFocus: false,
      width: '244px',
      data: {},
    });
    dialogRef.componentInstance.todo = todo;
    dialogRef.componentInstance.selector.subscribe((boardId: string) => {
      if (todo && boardId) {
        this.boardsService
          .moveTodoBetweenBoards$(todo, todo.boardId || '', boardId, 0)
          .pipe(
            tap((res) => {
              if (res.data?.moveTodoBetweenBoards) {
                this.todosService.updateTodo({ ...todo, boardId });
              }
            })
          )
          .subscribe();
      }
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
            this.boardsService.updateBoards((b) => b.id !== boardId);
            this.todosService.screen((todo) =>
              todo.boardId === boardId ? { ...todo, boardId: '' } : todo
            );
          }
        })
      );
  }
}
