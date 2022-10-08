import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { debounce, firstValueFrom, interval, Subscription, tap } from 'rxjs';
import { BoardsService, TodosService, UserService } from 'src/app/services';
import { ITodo, ITypedObject, Nullable } from 'src/types';
import { SelectBoardDialog } from '../dialogs/select-board.component';

const autoDelay = 1000;
const updateKeys = ['text', 'markdown', 'done'];

@Component({
  selector: 'todo-editor',
  templateUrl: './todo-editor.component.html',
  styleUrls: ['./todo-editor.component.scss'],
})
export class TodoEditor implements OnInit, OnChanges, OnDestroy {
  @Input() size: number = 2;
  @Input() todo: Nullable<ITodo> = null;
  showMarkdown: boolean = false;
  todoForm: FormGroup;
  text: string = '';
  private formSub: Nullable<Subscription> = null;
  private resetSub: Nullable<Subscription> = null;

  constructor(
    private userService: UserService,
    private todosService: TodosService,
    private boardsService: BoardsService,
    private dialog: MatDialog
  ) {
    this.todoForm = new FormGroup({
      text: new FormControl(),
      tag: new FormControl(),
      priority: new FormControl(),
      markdown: new FormControl(),
      done: new FormControl(),
    });
  }

  ngOnInit() {
    this.formSub = this.todoForm.valueChanges
      .pipe(
        tap((changes) => {
          this.showMarkdown = Boolean(changes?.markdown);
          this.text = changes?.text || ""
        }),
        debounce(() => interval(autoDelay)),
        tap((changes) => this.updateTodo(changes))
        // TODO tap auto-saved feedback
      )
      .subscribe();

    this.resetSub = this.todosService.resetTodoEditor$
      .pipe(
        tap((signal) => {
          if (signal) {
            this.resetTodo();
          }
        })
      )
      .subscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    const newTodo = changes['todo']?.currentValue;
    if (newTodo) {
      this.todoForm.patchValue({
        text: newTodo.text,
        tag: newTodo.tag,
        priority: newTodo.priority,
        markdown: newTodo.markdown,
        done: newTodo.done,
      });
    }
    this.focusEditor();
  }

  ngOnDestroy() {
    this.formSub?.unsubscribe();
    this.resetSub?.unsubscribe();
  }

  deleteTodo() {
    if (this.userService.currentUser && this.todo) {
      firstValueFrom(
        this.todosService.deleteTodo$(
          this.userService.currentUser.id,
          this.todo.id
        )
      )
        .then(() => {
          // inline call doesn't work
          this.resetTodo();
        })
        .catch(console.error);
    }
  }

  focusEditor() {
    document.getElementById('todo-editor')?.focus();
  }

  resetTodo(focus = false) {
    this.todo = null;
    this.todoForm.patchValue({
      text: '',
      tag: '',
      priority: 2,
      markdown: false,
      done: false,
    });
    if (focus) this.focusEditor();
  }

  updateTodo(updateTodo: ITypedObject) {
    if (this.todo) {
      const updatedTodo: ITypedObject = {
        userId: this.todo.userId,
        id: this.todo.id,
      };
      let flagUpdate = false;
      for (const key of updateKeys) {
        const newVal = updateTodo[key];
        if (
          newVal !== undefined &&
          newVal !== (this.todo as ITypedObject)[key]
        ) {
          flagUpdate = true;
          updatedTodo[key] = newVal;
        }
      }
      if (flagUpdate) {
        this.todo = { ...this.todo, ...updatedTodo };
        this.todosService.updateTodo$(updatedTodo).subscribe();
      }
    } else if (updateTodo['text'] && this.userService.currentUser?.id) {
      this.todosService
        .createTodo$(this.userService.currentUser.id, updateTodo['text'])
        .pipe(
          tap((todo) => {
            if (todo) this.todo = todo;
          })
        )
        .subscribe();
    }
  }

  addToBoard() {
    if (!this.todo) return;

    const dialogRef = this.dialog.open(SelectBoardDialog, {
      autoFocus: false,
      width: '244px',
      data: {},
    });

    dialogRef.componentInstance.todo = this.todo;
    dialogRef.componentInstance.selector.subscribe((boardId: string) => {
      if (this.todo && boardId) {
        this.boardsService.addTodoToBoard$(this.todo, boardId).subscribe();
        this.todosService.addTodoToBoardCB({ ...this.todo, boardId });
      }
    });
  }
}
