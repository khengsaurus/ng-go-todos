import { Component, Inject, Input, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EditTodoDirective } from 'src/app/directives/edit-todo.directive';
import { TodosService, UserService } from 'src/app/services';
import { ITodo, Nullable } from 'src/types';

@Component({
  selector: 'preview-todo',
  template: `
    <div class="dialog-content">
      <div class="todo-text">
        <markdown-viewer
          *ngIf="todo?.markdown"
          [text]="todo?.text || ''"
          [format]="true"
          class="markdown-viewer"
        ></markdown-viewer>
        <div *ngIf="!todo?.markdown">{{ todo?.text }}</div>
      </div>
      <form [formGroup]="todoForm" class="footer baseline-end">
        <dropdown-select
          label="Priority"
          controlName="priority"
          [options]="[1, 2, 3]"
        ></dropdown-select>
        <mat-checkbox class="btn" formControlName="done" disableRipple
          >Done</mat-checkbox
        >
      </form>
    </div>
  `,
  styleUrls: ['./dialog.scss'],
})
export class PreviewTodoDialog extends EditTodoDirective implements OnDestroy {
  @Input() override todo: Nullable<ITodo> = null;
  @Input() onDestory = (todo: Nullable<ITodo>) => {};

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
