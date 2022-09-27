import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input } from '@angular/core';
import { tap } from 'rxjs';
import { BoardsService, UserService } from 'src/app/services';
import { IBoard, ITodo } from 'src/types';

const initBoard: IBoard = {
  id: '',
  userId: '',
  name: '',
  todos: [],
  // todoIds: [],
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
  // orderedTodos: ITodo[] = [];

  constructor(
    private boardsService: BoardsService,
    private userService: UserService
  ) {}

  // ngOnChanges(changes: SimpleChanges): void {
  //   const board = changes['board']?.currentValue as IBoard;
  //   if (board) {
  //     this.orderedTodos = board.todoIds
  //       .map((todoId) => board.todos.find((todo) => todo.id === todoId))
  //       .filter((todo) => todo) as ITodo[];
  //   }
  // }

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
      const oldBoard = { ...this.board }; // reset on failure

      const newTodos = [...this.board.todos];
      moveItemInArray(newTodos, previousIndex, currentIndex);
      this.board = { ...this.board, todos: newTodos };

      this.boardsService
        .moveTodos$(
          newTodos.map((todo) => todo.id),
          this.board.id
        )
        .pipe(
          tap((res) => {
            if (!res?.data?.moveTodos) {
              this.board = oldBoard;
            }
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
