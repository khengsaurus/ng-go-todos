import { Component, Input } from '@angular/core';
import { IBoard } from 'src/types';

@Component({
  selector: 'board-form',
  templateUrl: './board-form.component.html',
  styleUrls: ['./form.scss'],
})
export class BoardForm {
  @Input() data: any;
  @Input() initBoard: IBoard | undefined = undefined;

  // TODO: enum this
  colors = ['gray', 'purple', 'blue', 'green', 'yellow', 'orange', 'red'];
}
