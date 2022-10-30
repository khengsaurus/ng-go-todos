import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BoardsService } from 'src/app/services';
import { IBoard, ITodo } from 'src/types';

@Component({
  selector: 'select-board',
  templateUrl: './select-board.component.html',
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
