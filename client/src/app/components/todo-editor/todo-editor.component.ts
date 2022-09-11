import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { debounce, firstValueFrom, interval, Subscription, tap } from 'rxjs';
import { TodosService, UserService } from 'src/app/services';
import { ITodo, ITypedObject, Nullable } from 'src/types';

const autoDelay = 1000;

@Component({
  selector: 'todo-editor',
  templateUrl: './todo-editor.component.html',
  styleUrls: ['./todo-editor.component.scss'],
})
export class TodoEditor implements OnInit, OnChanges, OnDestroy {
  @Input() size: number = 2;
  @Input() todo: Nullable<ITodo> = null;
  todoForm: FormGroup;
  private formSub: Nullable<Subscription> = null;

  constructor(
    private todoService: TodosService,
    private userService: UserService
  ) {
    this.todoForm = new FormGroup({
      text: new FormControl(),
      tag: new FormControl(),
      priority: new FormControl(),
      done: new FormControl(),
    });
  }

  ngOnInit(): void {
    this.formSub = this.todoForm.valueChanges
      .pipe(
        debounce(() => interval(autoDelay)),
        tap((changes) => this.updateTodo(changes))
        // TODO tap auto-saved feedback
      )
      .subscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const newTodo = changes['todo']?.currentValue;
    if (newTodo) {
      this.todoForm.patchValue({
        text: newTodo.text,
        tag: newTodo.tag,
        priority: newTodo.priority,
        done: newTodo.done,
      });
    }
    this.focusEditor();
  }

  ngOnDestroy(): void {
    this.formSub?.unsubscribe();
  }

  deleteTodo() {
    if (this.userService.currentUser && this.todo) {
      firstValueFrom(
        this.todoService.deleteTodo$(
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
        this.todoService.updateTodo$(updatedTodo).subscribe();
      }
    } else if (updateTodo['text'] && this.userService.currentUser?.id) {
      this.todoService
        .createTodo$(updateTodo['text'], this.userService.currentUser.id)
        .pipe(
          tap((todo) => {
            if (todo) this.todo = todo;
          })
        )
        .subscribe();
    }
  }
}

const updateKeys = ['text', 'done'] as unknown as 'text' | 'done';
