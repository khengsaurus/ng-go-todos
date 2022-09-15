import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, Input } from '@angular/core';
import { BoardsService, UserService } from 'src/app/services';
import { IBoard } from 'src/types';

const initBoard: IBoard = {
  id: '',
  userId: '',
  name: '',
  todos: [],
  createdAt: undefined,
  updatedAt: undefined,
};

@Component({
  selector: 'board-component',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class Board {
  @Input() board: IBoard = initBoard;

  constructor(
    private boardService: BoardsService,
    private userService: UserService
  ) {}

  taskDrop(event: CdkDragDrop<string[]>) {
    // if (this.board.id && this.board.todoIds) {
    //   moveItemInArray(
    //     this.board.todoIds,
    //     event.previousIndex,
    //     event.currentIndex
    //   );
    //   this.boardService.updateTasks(this.board.id, this.board.todoIds);
    // }
  }

  handleDelete() {
    if (this.userService.currentUser) {
      this.boardService
        .deleteBoard$(this.userService.currentUser.id, this.board.id)
        .subscribe();
    }
  }
}
