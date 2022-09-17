import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'board-dialog',
  template: `
    <div>
      <h2>Create a new Board</h2>
      <div class="board-dialog-content">
        <mat-form-field>
          <input placeholder="Board name" matInput [(ngModel)]="data.title" />
        </mat-form-field>
      </div>
      <div class="row spaced">
        <button mat-button class="btn-s" (click)="onNoClick()">Cancel</button>
        <button mat-button class="btn-s" [mat-dialog-close]="data.title">
          Create
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./dialog.scss'],
})
export class BoardDialog {
  constructor(
    public dialogRef: MatDialogRef<BoardDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
