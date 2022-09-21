import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription, tap } from 'rxjs';
import { NewBoardDialog } from 'src/app/components/dialogs/new-board.component';
import { BoardsService, UserService } from 'src/app/services';
import { IBoard } from 'src/types';

@Component({
  selector: 'boards-page',
  templateUrl: './boards-page.component.html',
  styleUrls: ['./boards-page.component.scss'],
})
export class BoardsPage implements OnInit, OnDestroy {
  public boards: IBoard[] = [];
  private boardsSub!: Subscription;

  constructor(
    public boardsService: BoardsService,
    private userService: UserService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.boardsSub = this.boardsService.currentUserBoards$
      .pipe(tap((boards) => (this.boards = boards)))
      .subscribe();
  }

  ngOnDestroy(): void {
    this.boardsSub.unsubscribe();
  }

  openBoardDialog() {
    const dialogRef = this.dialog.open(NewBoardDialog, {
      autoFocus: false,
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

  dropBoard(event: CdkDragDrop<string[]>) {
    const { previousIndex, currentIndex } = event;
    if (previousIndex === currentIndex) return;
    const orderedBoards = this.boards.map((board) => board.id);
    moveItemInArray(orderedBoards, previousIndex, currentIndex);
    const oldBoards = [...this.boards]; // reset on failure
    const updatedBoards = [...this.boards];
    moveItemInArray(updatedBoards, previousIndex, currentIndex);
    this.boards = updatedBoards;
    this.userService
      .moveBoards$(orderedBoards)
      .pipe(
        tap((res) => {
          if (!res?.data?.moveBoards) this.boards = oldBoards;
        })
      )
      .subscribe();
  }
}
