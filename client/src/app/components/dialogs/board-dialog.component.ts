import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'board-dialog',
  template: `
    <h2 mat-dialog-title>Create a new Board</h2>
    <div mat-dialog-content>
      <p>Board name:</p>
      <mat-form-field>
        <input placeholder="Name" matInput [(ngModel)]="data.title" />
      </mat-form-field>
    </div>
    <div mat-dialog-actions class="row spaced">
      <button mat-button class="btn-m" (click)="onNoClick()">Cancel</button>
      <button mat-button class="btn-m" [mat-dialog-close]="data.title">
        Create
      </button>
    </div>
  `,
  styles: [],
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
