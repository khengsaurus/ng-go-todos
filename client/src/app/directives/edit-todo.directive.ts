import {
  Directive,
  Inject,
  Injectable,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { debounce, interval, Subscription, tap } from 'rxjs';
import { ITodo, ITypedObject } from 'src/types';
import { TodosService, UserService } from '../services';
import { scrollEle } from '../utils';

const autoSaveDelay = 1000;
const updateKeys = ['text', 'markdown', 'priority', 'done'];

const initTodo = {
  text: '',
  tag: '',
  priority: 2,
  markdown: false,
  done: false,
};

export const TodoEditorId = 'todo-editor';

@Directive()
export abstract class EditTodoDirective
  implements OnInit, OnChanges, OnDestroy
{
  @Input() todo: ITodo | undefined;
  updateCallback: (todo: ITodo) => void;
  todoForm: FormGroup;
  showMarkdown: boolean = false;
  text: string = '';
  private formSub: Subscription | undefined;
  private resetSub: Subscription | undefined;

  constructor(
    protected userService: UserService,
    protected todosService: TodosService,
    updateCallback = () => {}
  ) {
    this.updateCallback = updateCallback;
    this.todoForm = new FormGroup({
      text: new FormControl(initTodo.text),
      priority: new FormControl(initTodo.priority),
      markdown: new FormControl(initTodo.markdown),
      done: new FormControl(initTodo.done),
    });
  }

  ngOnInit() {
    this.todoForm.patchValue({
      text: this.todo?.text || initTodo.text,
      priority: this.todo?.priority || initTodo.priority,
      markdown: this.todo?.markdown || initTodo.markdown,
      done: this.todo?.done || initTodo.done,
    });
    this.formSub = this.todoForm.valueChanges
      .pipe(
        tap((changes) => {
          this.showMarkdown = Boolean(changes?.markdown);
          this.text = changes?.text || '';
        }),
        debounce(() => interval(autoSaveDelay)),
        tap((todo) => {
          this.updateCallback(todo);
          this.updateTodo(todo);
        })
        // TODO tap auto-saved feedback
      )
      .subscribe();

    this.resetSub = this.todosService.resetTodoEditor$
      .pipe(
        tap((signal) => {
          if (signal) this.resetTodo();
        })
      )
      .subscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    const existingTodo = changes['todo']?.currentValue;
    if (existingTodo) {
      this.todoForm.patchValue({
        text: existingTodo.text,
        priority: existingTodo.priority,
        markdown: existingTodo.markdown,
        done: existingTodo.done,
      });
      scrollEle(TodoEditorId);
    } else {
      document.getElementById(TodoEditorId)?.focus();
    }
  }

  ngOnDestroy() {
    this.resetSub?.unsubscribe();
    this.formSub?.unsubscribe();
    if (this.todo) this.todosService.updateTodoInplace(this.todo);
  }

  updateTodo(newTodo: ITypedObject) {
    if (this.todo) {
      const updatedTodo: ITypedObject = {
        userId: this.todo.userId,
        id: this.todo.id,
      };
      let flagUpdate = false;
      for (const key of updateKeys) {
        const newVal = newTodo[key];
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
    } else if (newTodo['text'] && this.userService.currentUser?.id) {
      this.todosService
        .createTodo$(this.userService.currentUser.id, newTodo['text'])
        .pipe(
          tap((_todo) => {
            if (_todo) {
              this.todo = _todo;
              this.todosService.selectTodo(_todo);
            }
          })
        )
        .subscribe();
    }
  }

  resetTodo() {
    this.todo = undefined;
    this.todoForm.patchValue(initTodo);
  }
}
