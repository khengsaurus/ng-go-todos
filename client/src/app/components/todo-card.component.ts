import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ITodo, Nullable } from 'src/types';

@Component({
  selector: 'todo-card',
  template: `
    <div *ngIf="todo">
      <mat-card class="todo" [class]="todo.tag">
        <mat-card-subtitle>{{ todoTitle }}</mat-card-subtitle>
      </mat-card>
    </div>
  `,
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
