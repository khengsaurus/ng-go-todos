import {
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { debounce, interval, Subscription, tap } from 'rxjs';
import { ITodo, ITypedObject, Nullable } from 'src/types';
import { TodosService, UserService } from '../services';

const autoSaveDelay = 1000;
const updateKeys = ['text', 'markdown', 'priority', 'done'];

const initTodo = {
  text: '',
  tag: '',
  priority: 2,
  markdown: false,
  done: false,
};

@Inject('scrollEditor')
@Inject('focusEditor')
export class EditTodoDirective implements OnInit, OnChanges, OnDestroy {
  @Input() todo: Nullable<ITodo> = null;
  updateCallback: (todo: ITodo) => void;
  scrollEditor: () => void;
  focusEditor: () => void;
  todoForm: FormGroup;
  showMarkdown: boolean = false;
  text: string = '';
  private formSub: Nullable<Subscription> = null;
  private resetSub: Nullable<Subscription> = null;

  constructor(
    protected userService: UserService,
    protected todosService: TodosService,
    updateCallback = () => {},
    scrollEditor = () => {},
    focusEditor = () => {}
  ) {
    this.updateCallback = updateCallback;
    this.scrollEditor = scrollEditor;
    this.focusEditor = focusEditor;
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
    const newTodo = changes['todo']?.currentValue;
    if (newTodo) {
      this.todoForm.patchValue({
        text: newTodo.text,
        priority: newTodo.priority,
        markdown: newTodo.markdown,
        done: newTodo.done,
      });
      this.scrollEditor();
    }
    this.focusEditor();
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
    this.todo = null;
    this.todoForm.patchValue(initTodo);
  }
}
