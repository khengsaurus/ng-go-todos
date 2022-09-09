import { Component, Input, OnInit } from '@angular/core';
import { ITodo, Nullable } from 'src/types';

@Component({
  selector: 'todo-card',
  template: `
    <div *ngIf="todo">
      <mat-card class="todo" [class]="todo.tag">
        <mat-card-subtitle>{{ todo.text }}</mat-card-subtitle>
      </mat-card>
    </div>
  `,
})
export class TodoCard implements OnInit {
  @Input() todo: Nullable<ITodo> = null;

  constructor() {}

  ngOnInit(): void {}
}
