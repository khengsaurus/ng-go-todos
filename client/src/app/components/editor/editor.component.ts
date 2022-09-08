import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { debounce, interval, Subscription, takeWhile, tap } from 'rxjs';
import { TodosService, UserService } from 'src/app/services';
import { ITodo, Nullable } from 'src/types';

const autoDelay = 1000;

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements OnInit, OnChanges, OnDestroy {
  @Input() size: number = 2;
  @Input() todo: Nullable<ITodo> = null;
  todoForm: FormGroup;
  private formSub: Nullable<Subscription> = null;
  private currTodoId: string | undefined = undefined;

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
    this.formSub = this.todoForm.controls['text'].valueChanges
      .pipe(
        debounce(() => interval(autoDelay)),
        tap((str) => {
          if (str !== this.todo?.text) {
            this.updateTodoText(str);
          }
        })
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
      if (this.currTodoId !== newTodo.id) {
        setTimeout(() => (this.currTodoId = newTodo.id), autoDelay);
      }
    }
  }

  ngOnDestroy(): void {
    this.formSub?.unsubscribe();
  }

  updateTodoText(text: string) {
    if (this.todo) {
      this.todoService.updateTodo$({ ...this.todo, text }).subscribe();
    } else if (this.userService.currentUser?.id) {
      this.todoService
        .createTodo$(text, this.userService.currentUser.id)
        .subscribe();
    }
  }
}
