import { Component, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ITodo } from 'src/types';

@Component({
  selector: 'preview-todo',
  template: `
    <div>
      <markdown-viewer
        *ngIf="todo.markdown"
        [text]="todo.text"
        [format]="true"
        class="markdown-viewer"
      ></markdown-viewer>
      <div *ngIf="!todo.markdown">{{ todo.text }}</div>
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
}
