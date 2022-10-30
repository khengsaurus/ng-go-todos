import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'new-board',
  templateUrl: './new-board.component.html',
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
