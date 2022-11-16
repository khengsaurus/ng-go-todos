import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FilesService } from 'src/app/services';
import { IFile, ITodo } from 'src/types';
import { ConfirmDialog } from '../dialogs';

@Component({
  selector: 'file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss'],
})
export class FileComponent {
  @Input() file!: IFile;
  @Input() todo!: ITodo;
  @Input() removeCallback!: (fileKey: string) => void;

  constructor(private filesService: FilesService, private dialog: MatDialog) {}

  download() {
    this.filesService.downloadFile$(this.todo.userId, this.file).subscribe();
  }

  delete() {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      autoFocus: false,
      height: '150px',
      width: '250px',
    });

    dialogRef.componentInstance.prompt = `Are you sure you want to delete this file?`;
    dialogRef.componentInstance.callback = () =>
      this.removeCallback(this.file.key);
  }
}
