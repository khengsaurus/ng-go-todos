import { Component, Inject, Input, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EditTodoDirective } from 'src/app/directives';
import { TodosService, UserService } from 'src/app/services';
import { ITodo } from 'src/types';

@Component({
  selector: 'preview-todo',
  templateUrl: './preview-todo.component.html',
  styleUrls: ['./dialog.scss'],
})
export class PreviewTodoDialog extends EditTodoDirective implements OnDestroy {
  @Input() override todo: ITodo | undefined;
  @Input() onDestory = (_: ITodo | undefined) => {};
  public show = false;

  constructor(
    protected override userService: UserService,
    protected override todosService: TodosService,
    public dialogRef: MatDialogRef<PreviewTodoDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    super(userService, todosService);
    setTimeout(() => (this.show = true), 300);
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.onDestory) this.onDestory(this.todo);
  }

  onNoClick() {
    this.dialogRef.close();
  }
}
