import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'new-board',
  template: `
    <div>
      <h3>Create a new Board</h3>
      <div class="dialog-content">
        <mat-form-field>
          <input
            placeholder="Board name"
            matInput
            [(ngModel)]="data.title"
            #input
          />
        </mat-form-field>
      </div>
      <div class="row spaced">
        <button mat-button class="btn-s" (click)="onNoClick()">Cancel</button>
        <button
          mat-button
          class="btn-s"
          [mat-dialog-close]="data.title"
          disabled="{{ !data.title }}"
        >
          Create
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./dialog.scss'],
})
export class NewBoardDialog {
  constructor(
    public dialogRef: MatDialogRef<NewBoardDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick() {
    this.dialogRef.close();
  }
}
