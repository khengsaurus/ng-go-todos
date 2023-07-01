import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

interface BoardData {
  name: string;
  color: string;
  isEdit: boolean;
}

@Component({
  selector: 'board-form-dialog',
  templateUrl: './board-form.component.html',
  styleUrls: ['./dialog.scss'],
})
export class BoardFormDialog {
  constructor(
    public dialogRef: MatDialogRef<BoardFormDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Partial<BoardData>
  ) {}

  onNoClick() {
    this.dialogRef.close();
  }
}
