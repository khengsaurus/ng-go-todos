import { Component, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ITodo } from 'src/types';

@Component({
  selector: 'preview-todo',
  template: `
    <div class="dialog-content">
      <div class="header baseline-end">
        <p class="label">Priority:</p>
        <mat-form-field appearance="standard" [ngStyle]="{ width: '60px' }">
          <mat-select
            [value]="todo.priority.toString()"
            [ngStyle]="{ paddingLeft: '2px' }"
            (selectionChange)="priorityChange($event)"
          >
            <mat-option value="0">None</mat-option>
            <mat-option value="1">1</mat-option>
            <mat-option value="2">2</mat-option>
            <mat-option value="3">3</mat-option>
          </mat-select>
        </mat-form-field>
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

  priorityChange(e: any) {
    console.log(e);
  }
}
