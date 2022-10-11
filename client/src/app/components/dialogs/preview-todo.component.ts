import { Component, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ITodo } from 'src/types';

@Component({
  selector: 'preview-todo',
  template: `
    <div class="dialog-content">
      <div class="footer baseline-end">
        <p class="label">Priority:</p>
        <priority-select
          [priority]="todo.priority"
          [handleChange]="changePriority"
        ></priority-select>
        <mat-checkbox [checked]="todo.done" class="btn-m" disableRipple
          >Done</mat-checkbox
        >
      </div>
      <div class="todo-text">
        <markdown-viewer
          *ngIf="todo.markdown"
          [text]="todo.text"
          [format]="true"
          class="markdown-viewer"
        ></markdown-viewer>
        <div *ngIf="!todo.markdown">{{ todo.text }}</div>
      </div>
    </div>
  `,
  styleUrls: ['./dialog.scss'],
})
export class PreviewTodoDialog {
  @Input() todo!: ITodo;

  constructor(
    public dialogRef: MatDialogRef<PreviewTodoDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick() {
    this.dialogRef.close();
  }

  changePriority(e: any) {
    console.log('TODO');
  }
}
