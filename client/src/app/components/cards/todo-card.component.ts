import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { pipe, tap } from 'rxjs';
import { BoardsService, MixedService } from 'src/app/services';
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
  @Input() colorTag = false;
  todoTitle: string = '';
  colorTagClass: string = '';

  constructor(private boardsService: BoardsService, private dialog: MatDialog) {
    this.boardsService.currentUserBoards$
      .pipe(
        tap((boards) => {
          const color = boards.find((b) => b.id === this.todo?.boardId)?.color;
          this.colorTagClass = color ? `${color}-bg` : '';
        })
      )
      .subscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Get color tag and first line
    const _todo = changes['todo'];
    if (!_todo) return;
    if (_todo.previousValue?.boardId !== _todo.currentValue?.boardId) {
      this.setColorTag();
    }
    this.todoTitle = (_todo.currentValue?.text || '').split(/\r?\n|\r|\n/g)[0];
    if (changes['active'] !== undefined) {
      this.active = changes['active'].currentValue || false;
    }
  }

  setColorTag() {
    const color = this.boardsService.getBoardColor(this.todo?.boardId || '');
    this.colorTagClass = color ? `${color}-bg` : '';
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
