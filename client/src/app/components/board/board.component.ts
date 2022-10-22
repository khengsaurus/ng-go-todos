import {
  CdkDragDrop,
  CdkDragRelease,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { tap } from 'rxjs';
import { BoardsService, TodosService, UserService } from 'src/app/services';
import { haltEvent, trackById } from 'src/app/utils';
import { IBoard, ITodo, Nullable } from 'src/types';

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
  editCallback = this._editCallback.bind(this);
  haltEvent = haltEvent;

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

  todoListDrop(event: CdkDragDrop<ITodo[]>) {
    if (event.previousContainer === event.container) {
      const { previousIndex, currentIndex } = event;
      if (!this.board.id || previousIndex === currentIndex) return;
      const oldBoard = { ...this.board }; // reset on failure
      const newTodos = [...this.board.todos];
      moveItemInArray(newTodos, previousIndex, currentIndex);
      this.board = { ...this.board, todos: newTodos };
      this.todos = newTodos;
      this.boardsService
        .moveTodos$(
          newTodos.map((todo) => todo.id),
          this.board.id
        )
        .pipe(
          tap((res) => {
            if (!res?.data?.moveTodos) {
              this.board = oldBoard;
              this.todos = oldBoard.todos;
            }
          })
        )
        .subscribe();
    } else {
      const { previousContainer, previousIndex, container, currentIndex } =
        event;
      const prevTodos = previousContainer.data || [];
      const todo =
        prevTodos.length < previousIndex + 1
          ? undefined
          : prevTodos[previousIndex];
      if (todo?.id) {
        this.boardsService
          .shiftTodoBetweenBoards$(
            todo,
            previousContainer.id,
            container.id,
            currentIndex
          )
          .subscribe();
      }
    }
  }

  deleteTodoDrop(event: CdkDragDrop<ITodo[]>) {
    const oldTodos = [...this.todos];
    const newTodos = [...this.todos];
    const toRemove = event.item.data as ITodo;
    if (toRemove?.id) {
      this.renderTodos(newTodos);
      this.boardsService
        .removeTodoFromBoard$(toRemove.id, this.board.id)
        .pipe(
          tap((res) => {
            if (!res.data?.removeTodoFromBoard) {
              this.renderTodos(oldTodos);
            } else {
              this.boardsService.addRmTodoOnBoard(
                toRemove,
                this.board.id,
                false
              );
              this.todosService.updateTodoInplace({ ...toRemove, boardId: '' });
            }
          })
        )
        .subscribe();
    }
  }

  todoDragStart() {
    this.showTodoOptions = true;
  }

  todoDragReleased(event: CdkDragRelease<ITodo>) {
    this.showTodoOptions = false;
    const todo = event.source.data as ITodo;
    const target = (event.event.target as HTMLElement).id;
    if (this.board?.id !== target) {
      const todos = [...this.todos].filter((t) => t.id !== todo.id);
      this.renderTodos(todos);
    }
  }

  private renderTodos(todos: ITodo[], duplicate = false) {
    this.todos = duplicate ? [...todos] : todos;
    this.minHeight = `${todos.length * 66 - 10}px`;
  }

  _editCallback(todo?: Nullable<ITodo>) {
    this.todos = this.todos?.map((t) => (t.id === todo?.id ? todo : t));
  }

  trackById = trackById;
}
