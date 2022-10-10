import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BoardsService } from 'src/app/services';
import { IBoard, ITodo } from 'src/types';

@Component({
  selector: 'select-board',
  template: `
    <div>
      <h3>Add todo to a board</h3>
      <div class="dialog-content small">
        <div *ngFor="let board of boardsService.currentUserBoards$ | async">
          <button
            mat-button
            class="list-option"
            (click)="select(board)"
            [disabled]="todoPresentInBoard(board)"
          >
            {{ board.name }}
          </button>
        </div>
      </div>
      <div class="dialog-footer">
        <button
          mat-raised-button
          color="accent"
          (click)="boardsService.openBoardDialog()"
        >
          New Board
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./dialog.scss'],
})
export class SelectBoardDialog {
  @Input() todo!: ITodo;
  @Output() selector = new EventEmitter<any>();

  constructor(
    public dialogRef: MatDialogRef<SelectBoardDialog>,
    public boardsService: BoardsService,
    @Inject(MAT_DIALOG_DATA) public boardId: any
  ) {}

  todoPresentInBoard(board: IBoard) {
    return !!board.todos.find((todo) => todo.id === this.todo.id);
  }

  select(board: IBoard) {
    this.selector.emit(board.id);
    this.dialogRef.close();
  }

  onNoClick() {
    this.dialogRef.close();
  }
}
