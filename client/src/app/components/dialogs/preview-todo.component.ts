import { Component, Inject, Input, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EditTodoDirective } from 'src/app/directives/edit-todo.directive';
import { TodosService, UserService } from 'src/app/services';
import { ITodo, Nullable } from 'src/types';

@Component({
  selector: 'preview-todo',
  templateUrl: './preview-todo.component.html',
  styleUrls: ['./dialog.scss'],
})
export class PreviewTodoDialog extends EditTodoDirective implements OnDestroy {
  @Input() override todo: Nullable<ITodo> = null;
  @Input() onDestory = (_: Nullable<ITodo>) => { };

  constructor(
    protected override userService: UserService,
    protected override todosService: TodosService,
    public dialogRef: MatDialogRef<PreviewTodoDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    super(userService, todosService);
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.onDestory) this.onDestory(this.todo);
  }

  onNoClick() {
    this.dialogRef.close();
  }
}
