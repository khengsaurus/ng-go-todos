import { Component, Input } from '@angular/core';
import { firstValueFrom, of, switchMap, tap } from 'rxjs';
import { EditTodoDirective } from 'src/app/directives/edit-todo.directive';
import {
  BoardsService,
  FilesService,
  MixedService,
  TodosService,
  UserService,
} from 'src/app/services';
import { scrollEle } from 'src/app/utils';
import { ITodo, Nullable } from 'src/types';

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
    private mixedService: MixedService
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
        .then(() => {
          this.boardsService.rmTodoFromBoards(this.todo!);
          this.resetTodo();
        })
        .catch(console.error);
    }
  }

  moveToBoard() {
    if (!this.todo) return;
    this.mixedService.moveTodoToBoard(this.todo);
  }

  handleAttachFile(event: any) {
    const file = (event?.target?.files || [undefined])[0];
    if (!this.todo?.id || !file) return;
    let key = '';
    this.filesService
      .uploadFile$(this.todo.id, file)
      .pipe(
        switchMap((fileKey) => {
          key = fileKey;
          return fileKey
            ? this.todosService.addRmTodoFile$(this.todo!, fileKey, file.name)
            : of('');
        }),
        tap((uploaded) => {
          if (uploaded) {
            const files = [
              ...(this.todo!.files || []),
              { key, name: file.name, uploaded },
            ];
            this.todo = { ...this.todo, files } as ITodo;
          }
        })
      )
      .subscribe();
  }

  removeCallback = ((fileKey: string) => {
    this.todosService
      .addRmTodoFile$(this.todo!, fileKey, '', true)
      .pipe(
        switchMap((res) => {
          return res === '-1'
            ? this.filesService.deleteFile$(this.todo!, fileKey)
            : of(true);
        }),
        tap((err) => {
          if (!err) {
            const files =
              this.todo!.files?.filter((f) => f.key !== fileKey) || [];
            this.todo = { ...this.todo, files } as ITodo;
          }
        })
      )
      .subscribe();
  }).bind(this);
}
