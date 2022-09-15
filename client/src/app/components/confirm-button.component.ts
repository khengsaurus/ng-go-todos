import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'confirm-button',
  template: `
    <div class="row center">
      <button
        mat-button
        class="btn-m"
        color="warn"
        (click)="canAction ? confirmAction() : promptAction()"
      >
        <mat-icon>{{ icon }}</mat-icon>
        <span>{{ canAction ? 'Confirm' : label }}</span>
      </button>
    </div>
  `,
})
export class ConfirmButton {
  @Input() icon: string = '';
  @Input() label: string = '';
  @Input() timeout: number = 3000;
  @Output() action = new EventEmitter<boolean>();
  canAction: boolean;

  constructor() {
    this.canAction = false;
  }

  promptAction() {
    this.canAction = true;
    setTimeout(() => (this.canAction = false), this.timeout);
  }

  confirmAction() {
    this.action.emit(true);
  }
}
