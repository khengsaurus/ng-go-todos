import { Component, Input, OnInit } from '@angular/core';
import { ITodo, Nullable } from 'src/types';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.scss'],
})
export class TodoComponent implements OnInit {
  @Input() todo: Nullable<ITodo> = null;

  constructor() {}

  ngOnInit(): void {}
}
