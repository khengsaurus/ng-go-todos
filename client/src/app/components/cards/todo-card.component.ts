import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ITodo, Nullable } from 'src/types';
import { PreviewTodoDialog } from '../dialogs';

@Component({
  selector: 'todo-card',
  templateUrl: './todo-card.component.html',
  styleUrls: ['./cards.scss'],
})
export class TodoCard implements OnChanges {
  @Input() todo: Nullable<ITodo> = null;
  @Input() active = false;
  @Input() triggerModal = false;
  @Input() editCallback = (_: Nullable<ITodo>) => {};
  todoTitle: string = '';

  constructor(private dialog: MatDialog) {}

  ngOnChanges(changes: SimpleChanges): void {
    // Get first line
    if (changes['todo'] !== undefined) {
      this.todoTitle = (changes['todo'].currentValue?.text || '').split(
        /\r?\n|\r|\n/g
      )[0];
    }
    if (changes['active'] !== undefined) {
      this.active = changes['active'].currentValue || false;
    }
  }

  openBoardDialog() {
    if (!this.todo) return;

    const dialogRef = this.dialog.open(PreviewTodoDialog, {
      autoFocus: false,
      minHeight: '200px',
      maxHeight: 'calc(100vh - 100px)',
      minWidth: '600px',
      maxWidth: '80vw',
      data: {},
    });

    dialogRef.componentInstance.todo = this.todo;
    dialogRef.componentInstance.onDestory = this.editCallback;
  }
}
