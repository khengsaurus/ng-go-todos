import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { EditTodoDirective } from 'src/app/directives/edit-todo.directive';
import { BoardsService, TodosService, UserService } from 'src/app/services';
import { scrollEle } from 'src/app/utils';
import { ITodo, Nullable } from 'src/types';
import { SelectBoardDialog } from '../dialogs/select-board.component';

const autoDelay = 1000;
const updateKeys = ['text', 'markdown', 'priority', 'done'];

@Component({
  selector: 'todo-editor',
  templateUrl: './todo-editor.component.html',
  styleUrls: ['./todo-editor.component.scss'],
})
export class TodoEditor extends EditTodoDirective {
  @Input() override todo: Nullable<ITodo> = null;
  @Input() size: number = 2;

  constructor(
    protected override userService: UserService,
    protected override todosService: TodosService,
    private boardsService: BoardsService,
    private dialog: MatDialog
  ) {
    super(
      userService,
      todosService,
      () => scrollEle('todo-editor'),
      () => document.getElementById('todo-editor')?.focus()
    );
  }

  deleteTodo() {
    if (this.userService.currentUser && this.todo) {
      firstValueFrom(
        this.todosService.deleteTodo$(
          this.userService.currentUser.id,
          this.todo.id
        )
      )
        .then(() => this.resetTodo())
        .catch(console.error);
    }
  }

  addToBoard() {
    if (!this.todo) return;

    const dialogRef = this.dialog.open(SelectBoardDialog, {
      autoFocus: false,
      width: '244px',
      data: {},
    });

    dialogRef.componentInstance.todo = this.todo;
    dialogRef.componentInstance.selector.subscribe((boardId: string) => {
      if (this.todo && boardId) {
        this.boardsService.addTodoToBoard$(this.todo, boardId).subscribe();
        this.todosService.addTodoToBoardCB({ ...this.todo, boardId });
      }
    });
  }
}
