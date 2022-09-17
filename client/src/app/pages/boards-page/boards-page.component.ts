import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BoardDialog } from 'src/app/components/dialogs/board-dialog.component';
import { BoardsService, UserService } from 'src/app/services';

@Component({
  selector: 'boards-page',
  templateUrl: './boards-page.component.html',
  styleUrls: ['./boards-page.component.scss'],
})
export class BoardsPage implements OnInit {
  constructor(
    public boardsService: BoardsService,
    private userService: UserService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {}

  openBoardDialog(): void {
    const dialogRef = this.dialog.open(BoardDialog, {
      width: '244px',
      data: {},
    });

    dialogRef.afterClosed().subscribe((inputName) => {
      if (inputName && this.userService.currentUser) {
        this.boardsService
          .createBoard$(this.userService.currentUser.id, inputName)
          .subscribe();
      }
    });
  }
}
