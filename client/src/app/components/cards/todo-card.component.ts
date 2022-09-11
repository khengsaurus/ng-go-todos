import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ITodo, Nullable } from 'src/types';

@Component({
  selector: 'todo-card',
  template: `
    <mat-card class="todo" [class]="todo?.tag">
      <div class="row">
        <mat-card-subtitle class="todo-title">{{
          todoTitle
        }}</mat-card-subtitle>
        <mat-icon *ngIf="todo?.done" class="check">check</mat-icon>
      </div>
    </mat-card>
  `,
  styleUrls: ['./cards.scss'],
})
export class TodoCard implements OnChanges {
  @Input() todo: Nullable<ITodo> = null;
  todoTitle: string = '';

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    // Get first line
    this.todoTitle = (changes['todo'].currentValue?.text || '').split(
      /\r?\n|\r|\n/g
    )[0];
  }
}
