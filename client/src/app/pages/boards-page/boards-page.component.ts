import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, tap } from 'rxjs';
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
    private userService: UserService
  ) {}

  ngOnInit() {
    this.boardsSub = this.boardsService.currentUserBoards$
      .pipe(tap((boards) => (this.boards = boards)))
      .subscribe();
  }

  ngOnDestroy(): void {
    this.boardsSub.unsubscribe();
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
