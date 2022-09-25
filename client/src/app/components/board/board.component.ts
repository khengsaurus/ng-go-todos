import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input } from '@angular/core';
import { tap } from 'rxjs';
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
    private boardsService: BoardsService,
    private userService: UserService
  ) {}

  handleDelete() {
    if (this.userService.currentUser) {
      this.boardsService
        .deleteBoard$(this.userService.currentUser.id, this.board.id)
        .subscribe();
    }
  }

  dropTodo(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      const { previousIndex, currentIndex } = event;
      if (!this.board.id || previousIndex === currentIndex) return;
      const orderedTodoIds = this.board.todos.map((todo) => todo.id);
      moveItemInArray(orderedTodoIds, previousIndex, currentIndex);
      const oldBoard = { ...this.board }; // reset on failure
      const updatedTodos = [...this.board.todos];
      moveItemInArray(updatedTodos, previousIndex, currentIndex);
      this.board = { ...this.board, todos: updatedTodos };
      this.boardsService
        .moveTodos$(orderedTodoIds, this.board.id)
        .pipe(
          tap((res) => {
            if (!res?.data?.moveTodos) this.board = oldBoard;
          })
        )
        .subscribe();
    } else {
      console.log(
        `TODO: ${event.previousContainer.id}.${event.previousIndex} -> ${event.container.id}.${event.currentIndex}`
      );
    }
  }
}
