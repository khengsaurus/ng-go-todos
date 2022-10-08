import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ITodo, Nullable } from 'src/types';
import { PreviewTodoDialog } from '../dialogs';

@Component({
  selector: 'todo-card',
  template: `
    <mat-card
      class="todo"
      [class]="todo?.tag"
      [class.active]="active"
      (click)="triggerModal ? openBoardDialog() : null"
    >
      <div class="row">
        <div class="content">
          <mat-card-subtitle class="todo-title">{{
            todoTitle
          }}</mat-card-subtitle>
          <mat-icon *ngIf="todo?.done" class="check">check</mat-icon>
        </div>
        <ng-content></ng-content>
      </div>
    </mat-card>
  `,
  styleUrls: ['./cards.scss'],
})
export class TodoCard implements OnChanges {
  @Input() todo: Nullable<ITodo> = null;
  @Input() active = false;
  @Input() triggerModal = false;
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
      minWidth: '400px',
      maxWidth: '80vw',
      minHeight: '200px',
      maxHeight: '90vh',
      data: {},
    });

    dialogRef.componentInstance.todo = this.todo;
  }
}
