import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { tap } from 'rxjs';
import { BoardsService, TodosService, UserService } from 'src/app/services';
import { IBoard, ITodo } from 'src/types';

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
export class Board implements OnChanges {
  @Input() board: IBoard = initBoard;
  showTodoOptions: boolean = false;
  minHeight: string = '0px';
  todos: ITodo[] = [];
  toDelete: ITodo[] = [];

  constructor(
    private userService: UserService,
    private boardsService: BoardsService,
    private todosService: TodosService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    const todos = changes['board']?.currentValue?.todos || [];
    this.renderTodos(todos, true);
  }

  handleDelete() {
    if (this.userService.currentUser) {
      this.boardsService
        .deleteBoard$(this.userService.currentUser.id, this.board.id)
        .subscribe();
    }
  }

  dropTodo(event: CdkDragDrop<ITodo[]>) {
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
      const oldTodos = [...this.todos];
      const newTodos = [...this.todos];
      const spliced = newTodos.splice(event.previousIndex, 1);
      const toRemove = spliced[0]?.id;
      if (toRemove) {
        this.renderTodos(newTodos);
        this.todosService
          .removeTodoFromBoard$(toRemove, this.board.id)
          .pipe(
            tap((res) => {
              if (!res.data?.removeTodoFromBoard) {
                this.renderTodos(oldTodos);
              }
            })
          )
          .subscribe();
      }
    }
  }

  renderTodos(todos: ITodo[], duplicate = false) {
    this.todos = duplicate ? [...todos] : todos;
    this.minHeight = `${todos.length * 66}px`;
  }

  todoDragStart() {
    console.log('todoDragStart');
    this.showTodoOptions = true;
  }

  todoDragReleased() {
    this.showTodoOptions = false;
  }

  todoDeleteEntered() {
    console.log('todoDeleteEntered');
  }

  todoDeleteDrop(event: CdkDragDrop<ITodo[]>) {
    console.log('todoDeleteDrop');
  }

  todoCancelDrop(event: CdkDragDrop<ITodo[]>) {
    console.log('todoCancelDrop');
  }
}
