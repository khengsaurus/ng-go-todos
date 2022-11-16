import { Component, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./dialog.scss'],
})
export class ConfirmDialog {
  @Input() prompt!: string;
  @Input() callback!: () => any;

  constructor(private dialogRef: MatDialogRef<ConfirmDialog>) {}

  onYesClick() {
    this.callback();
    this.dialogRef.close();
  }

  onNoClick() {
    this.dialogRef.close();
  }
}
