import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom, of, switchMap, tap } from 'rxjs';
import { EditTodoDirective } from 'src/app/directives/edit-todo.directive';
import {
  BoardsService,
  FilesService,
  TodosService,
  UserService,
} from 'src/app/services';
import { scrollEle } from 'src/app/utils';
import { ITodo, Nullable } from 'src/types';
import { SelectBoardDialog } from '../dialogs/select-board.component';

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
    private filesService: FilesService,
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

  handleAttachFile(event: any) {
    const file = (event?.target?.files || [undefined])[0];
    if (!this.todo?.id || !file) return;
    let key = '';
    this.filesService
      .uploadFile$(this.todo.id, file)
      .pipe(
        switchMap((k) => {
          key = k;
          return this.todosService.addRmTodoFile(this.todo!, k, file.name);
        }),
        tap((success) => {
          if (success) {
            this.todosService.updateTodo$({
              ...this.todo,
              files: [...(this.todo?.files || []), { key, name: file.name }],
            });
          }
        })
      )
      .subscribe();
  }
}
